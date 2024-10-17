# 从零开始的渲染引擎-Aurora Chapter 3 阴影映射 Shadow Mapping

> *All the variety, all the charm, all the beauty of life is made up of light and shadow.* --Tolstoy

参考：
- *Real-time Rendering 4th Edition*
- Learn OpenGL [Shadow Mapping](https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping)
- [Bevy Engine](https://bevyengine.org/)
- [LearnOpenGL - CSM](https://learnopengl.com/Guest-Articles/2021/CSM)
- [Tutorial 49: Cascaded Shadow Mapping](https://ogldev.org/www/tutorial49/tutorial49.html)

实际上阴影的原理非常简单，但是实现起来还是有不少细节需要注意。

## 深度缓冲 Depth Buffer

深度缓冲实际上就是一张包含着每个像素深度的材质，在渲染前通过设置 `RenderPassDescriptor::depth_stencil_attachment` 来分配此次渲染所使用的深度缓冲。

在每一帧的 Fragment Shader 运行前，当前片元的深度会与深度缓冲中的深度相比较，如果满足 `RenderPipelineDescriptor` 中 的 `depth_stencil` 成员的 `DepthStencilState::depth_compare` ，则深度测试通过，写入当前深度至深度缓冲，并且运行 Fragment Shader 。

![](https://oss.443eb9.dev/islandsmedia/16/depth-buffer.png)

> *一张深度缓冲材质，为了便于查看，每个深度值都已被四次方处理。*

## 阴影材质 Shadow Map

阴影，本质上就是深度浅的东西遮住了深度深的东西，那么我们要做的事就变得非常简单了，通过比较当前片元的深度，和之前最近的片元的深度，如果当前片元更深，那么就说明被遮挡。

注意，这里的深度是从灯光的视角看过去的，在前向渲染中，我们需要使用每一盏灯作为摄像机来生成深度缓冲，并在正式渲染时，使用主摄像机生成的深度信息进行比较。

后文中，我们将与灯光等效的摄像机称为 Light View ，而主摄像机称为 Main View 。

### 方向光 Directional Lights

#### Light View

对于方向光，由于其不存在平移，因此它的位置可以和 Main View 的相一致（这只是个奇怪的技巧，避免 Main View 跑太远，先挖个坑，会使用其他的方法来进行优化）。 旋转则保持自己的旋转。并且计算 View Matrix 。

而 Projection Matrix ，由于方向光是平行光，对于场景内的任意一个点，他受到方向光的方向都是一致的，这和正交投影的效果很相似，因此，Light View 的 Projection Matrix 就是一个正交投影矩阵。

```rust
Light::Directional(l) => vec![GpuCamera {
    view: l
        .transform
        .with_translation(real_camera.transform.translation)
        .compute_matrix()
        .inverse(),
    proj: Mat4::orthographic_rh(-16., 16., -16., 16., -20., 20.),
    position_ws: real_camera.transform.translation,
    exposure: 0.,
}],
```

#### 阴影贴图 Shadow Map

方向光只需要单个方向的深度信息，因为他是平行光，所以我们只需要创建一张普通的 2D 深度材质来存储即可。

但是由于之后我们需要在 PBR 流程中，对于每一盏灯，都要使用他们对应的 Shadow Map ，所以，一次性把全部材质创建出来，成为一个 `texture_2d_array` ，会更加方便。

```rust
let directional_shadow_map = renderer.device.create_texture(&TextureDescriptor {
    label: Some("directional_shadow_map"),
    size: Extent3d {
        width: 1024,
        height: 1024,
        // Equals to number of directional lights.
        depth_or_array_layers: gpu_scene.light_counter.directional_lights.max(1),
    },
    mip_level_count: 1,
    sample_count: 1,
    dimension: TextureDimension::D2,
    format: TextureFormat::Depth32Float,
    // Render Attachment: For depth texture generation.
    // Texture Binding: For depth sampling in PBR rendering.
    usage: TextureUsages::RENDER_ATTACHMENT | TextureUsages::TEXTURE_BINDING,
    view_formats: &[],
});
```

然后和他对应的 `TextureView` ，是一个二维数组。

```rust
let directional_shadow_map_view =
    directional_shadow_map.create_view(&TextureViewDescriptor {
        label: Some("directional_shadow_map_view"),
        dimension: Some(TextureViewDimension::D2Array),
        ..Default::default()
    });
```

这里需要注意，这个 `TextureView` 是在 PBR 时，采样使用的，而不是生成 Shadow Map 的时候，渲染绑定的深度缓冲。因为这是一个数组，而渲染时，只能使用二维贴图。

因此我们还需要创建一个专门用于渲染时的 `TextureView` ：

```rust
let mut directional_desc = TextureViewDescriptor {
    label: Some("directional_shadow_map_render_view"),
    format: Some(TextureFormat::Depth32Float),
    dimension: Some(TextureViewDimension::D2),
    aspect: TextureAspect::DepthOnly,
    base_array_layer: 0,
    // Only one layer.
    array_layer_count: Some(1),
    ..Default::default()
};

// For each directional light, slice a layer for rendering.
for (id, light) in &scene.lights {
    let offsets = light
        .as_cameras(&scene.camera)
        .into_iter()
        .map(|camera| bf_light_view.push(&camera));

    match light {
        Light::Directional(_) => {
            directional_desc.base_array_layer = directional_index;
            let texture_view = shadow_maps.directional_shadow_map.create_view(&directional_desc);
            ... // Save the texture view for later rendering.
            directional_index += 1;
        }
        ... // Other types of lights.
    }
}
```

这样，我们只要在使用 Light View 渲染 Shadow Map 时，使用这个单层的 `TextureView` ，把深度信息写入到这个数组中这个灯所对应的那一层了。

最后创建采样器，这个采样器在之后都是通用的，不需要专门为了点光源再开一个。

```rust
let shadow_map_sampler = renderer.device.create_sampler(&SamplerDescriptor {
    label: Some("shadow_map_sampler"),
    compare: Some(CompareFunction::LessEqual),
    mag_filter: FilterMode::Linear,
    min_filter: FilterMode::Linear,
    mipmap_filter: FilterMode::Linear,
    ..Default::default()
});
```

这个采样器有些特殊，可以看到使用了 `CompareFunction` ，说明他采样的过程本质上是在比较。比较的方式是 `CompareFunction::LessEqual` 。

这是因为，在我们之后采样 Shadow Map 的时候，可以直接把当前片元的深度传入，让内置的函数做完：1.采样 Shadow Map 2.比较深度 这两项工作。

你可以查看 [`textureSampleCompare` 函数的定义](https://www.w3.org/TR/WGSL/#texturesamplecompare)，和 [`OpenGL 中对于比较模式的描述`](https://www.khronos.org/opengl/wiki/Sampler_Object#Comparison_mode)。

我们待会正式使用到这个采样方法的时候，还会介绍。

### 点光源 Omnidirectional Lights

诶为什么是 Omnidirectional Lights 而不是 Point Lights 呢？

因为 Point Light 和 Spot Light 本质上都是点光源，他们发射的光是散开来的，处理方式相同。

#### Light View

正如上面所说的，点光源需要全部方向的深度信息，因此需要创建 6 个摄像机，记录每一个方向的深度信息。

> 诶？为什么一定是6个呢，为什么不能是 4 个不能是 8 个？

因为 6 个刚好对应坐标轴 6 个方向，而且！在之后使用 Cube Map ，会更方便。

Cube Map 是一个由 6 张材质围成的一个立方体盒子，可以记录每一个方向的信息。在存储时，使用一个长度为 6 的二维材质数组。

在 [OpenGL 的 WIKI 中](https://www.khronos.org/opengl/wiki/Cubemap_Texture)，有记录这几张贴图的排列顺序：


| Layer number | Cubemap face                   |
| ------------ | ------------------------------ |
| 0            | GL_TEXTURE_CUBE_MAP_POSITIVE_X |
| 1            | GL_TEXTURE_CUBE_MAP_NEGATIVE_X |
| 2            | GL_TEXTURE_CUBE_MAP_POSITIVE_Y |
| 3            | GL_TEXTURE_CUBE_MAP_NEGATIVE_Y |
| 4            | GL_TEXTURE_CUBE_MAP_POSITIVE_Z |
| 5            | GL_TEXTURE_CUBE_MAP_NEGATIVE_Z |

因此在创建这六张贴图对应的 Light View 的时候，摄像机也必须朝向这几个方向。

同时由于一个摄像机负责立方体的一个面的渲染，所以他的 FOV 就是 90 度。

```rust
// From Bevy
pub struct CubeMapFace {
    pub target: Vec3,
    pub up: Vec3,
    pub id: Uuid,
}

// see https://www.khronos.org/opengl/wiki/Cubemap_Texture
pub const CUBE_MAP_FACES: [CubeMapFace; 6] = [
    // 0 	GL_TEXTURE_CUBE_MAP_POSITIVE_X
    CubeMapFace {
        target: Vec3::NEG_X,
        up: Vec3::NEG_Y,
        id: Uuid::from_u128(987456123548145124610214551202),
    },
    // 1 	GL_TEXTURE_CUBE_MAP_NEGATIVE_X
    CubeMapFace {
        target: Vec3::X,
        up: Vec3::NEG_Y,
        id: Uuid::from_u128(654653154451204512300215485120),
    },
    // 2 	GL_TEXTURE_CUBE_MAP_POSITIVE_Y
    CubeMapFace {
        target: Vec3::NEG_Y,
        up: Vec3::Z,
        id: Uuid::from_u128(120014512300230205685230),
    },
    // 3 	GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
    CubeMapFace {
        target: Vec3::Y,
        up: Vec3::NEG_Z,
        id: Uuid::from_u128(431105314304087942300),
    },
    // 4 	GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    CubeMapFace {
        target: Vec3::NEG_Z,
        up: Vec3::NEG_Y,
        id: Uuid::from_u128(065132643512148745120548),
    },
    // 5 	GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    CubeMapFace {
        target: Vec3::Z,
        up: Vec3::NEG_Y,
        id: Uuid::from_u128(1485120178465129865312),
    },
];

...

Light::Point(l) => CUBE_MAP_FACES
    .into_iter()
    .map(|face| {
        let trans = Transform::default()
            // Look at the cube map face.
            .looking_at(face.target, face.up)
            .with_translation(l.transform.translation);
        GpuCamera {
            view: trans.compute_matrix().inverse(),
            // FOV pi / 2 = 90°
            proj: Mat4::perspective_rh(std::f32::consts::FRAC_PI_2, 1., 0.1, 20.),
            position_ws: trans.translation,
            exposure: 0.,
        }
    })
    .collect(),
// Exactly the same.
Light::Spot(l) => CUBE_MAP_FACES
    .into_iter()
    .map(|face| {
        let trans = Transform::default()
            .looking_at(face.target, face.up)
            .with_translation(l.transform.translation);
        GpuCamera {
            view: trans.compute_matrix().inverse(),
            proj: Mat4::perspective_rh(std::f32::consts::FRAC_PI_2, 1., 0.1, 20.),
            position_ws: trans.translation,
            exposure: 0.,
        }
    })
    .collect(),
```

#### 阴影贴图 Shadow Map

创建 Cube Map ，和创建长度为 6 的二维材质数组没有区别。

```rust
let point_shadow_map = renderer.device.create_texture(&TextureDescriptor {
    label: Some("point_shadow_map"),
    size: Extent3d {
        width: 512,
        height: 512,
        // Sum of point lights count and spot lights count multiplied by 6.
        depth_or_array_layers: ((gpu_scene.light_counter.point_lights
            + gpu_scene.light_counter.spot_lights)
            * 6)
        .max(6),
    },
    mip_level_count: 1,
    sample_count: 1,
    dimension: TextureDimension::D2,
    format: TextureFormat::Depth32Float,
    usage: TextureUsages::RENDER_ATTACHMENT | TextureUsages::TEXTURE_BINDING,
    view_formats: &[],
});
```

但是 `TextureView` 需要注意：

```rust
let point_shadow_map_view = point_shadow_map.create_view(&TextureViewDescriptor {
    label: Some("point_shadow_map_view"),
    dimension: Some(TextureViewDimension::CubeArray),
    aspect: TextureAspect::DepthOnly,
    ..Default::default()
});
```

`CubeArray` ，顾名思义就是 Cube Map 数组，数组中每一个元素都是一个 Cube Map。

然后是生成 Shadow Map 时，绑定的深度缓冲使用的 `TextureView` 。

```rust
let mut point_desc = TextureViewDescriptor {
    label: Some("point_shadow_map_render_view"),
    format: Some(TextureFormat::Depth32Float),
    // Always 2D texture.
    dimension: Some(TextureViewDimension::D2),
    aspect: TextureAspect::DepthOnly,
    base_array_layer: 0,
    array_layer_count: Some(1),
    ..Default::default()
};

...

Light::Point(_) | Light::Spot(_) => {
    ... // Insert cameras into uniform buffer and get corresponding `offsets`.
    // You can simply treat them as Light View or cameras corresponding to each cube map faces.
    let texture_views = offsets
        .enumerate()
        .map(|(i_face, offset)| {
            point_desc.base_array_layer = point_index * 6 + i_face as u32;
            (
                shadow_maps.point_shadow_map.create_view(&point_desc),
                offset,
            )
        })
        .collect::<Vec<_>>();
    point_index += 1;
}
```

### 深度材质渲染 Rendering Depth Buffer

这里其实是一些实现上的细节补充。

首先，由于我们只需要深度信息，不需要颜色信息，因此在 `Pipeline::fragment` 中去掉 Color Target ：

```rust
fragment: Some(FragmentState {
    module: &module,
    entry_point: "fragment",
    compilation_options: PipelineCompilationOptions::default(),
    targets: &[None],
}),
```

注意，这里的 `targets` 必须给一个 `&[None]` 而不能是 `&[]` ！

以及很简单的一个 Shader ：

```rust
@vertex
fn vertex(in: VertexInput) -> @builtin(position) vec4f {
    return camera.proj * camera.view * vec4f(in.position, 1.);
}

@fragment
fn fragment() { }
```

还有一点，虽然 Fragment Shader 用不到，但是也必须定义。要不然你就没法指定 `target` 了。

## 采样 Sampling

好了，我们现在已经有了每盏灯对应的最小深度，也就是他们各自的深度缓冲，他们被放到了数组内，在这个阶段被采样。

### 方向光 Directional Lights

方向光的 Shadow Map 的采样就比较简单了，只要将当前片元的世界坐标，投影到方向光的 Light View 上面，获取到投影之后的裁剪空间坐标，并且计算出 UV ，采样即可。

```rust
@group(3) @binding(0) var<storage> light_views: array<Camera>;
@group(3) @binding(1) var shadow_map_sampler: sampler_comparison;
@group(3) @binding(2) var directional_shadow_map: texture_depth_2d_array;

fn sample_directional_shadow_map(light: u32, position_ws: vec3f) -> f32 {
    // Project the mesh point on to light view.
    let position_cs = light_views[light].proj * light_views[light].view * vec4f(position_ws, 1.);
    // In fact this division can be removed, as we are using orthographic projection.
    let ndc = position_cs.xy / position_cs.w;
    var uv = (ndc + 1.) / 2.;
    // Invert uv.
    uv.y = 1. - uv.y;
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) {
        // Out of bound.
        return 1.;
    } else {
        let frag_depth = saturate(position_cs.z);
        return textureSampleCompare(directional_shadow_map, shadow_map_sampler, uv, light, frag_depth);
    }

    return 1.;
}
```

这里的 `textureSampleCompare` 的作用相当于：

- 采样 `uv` 处的深度
- 将该深度与 `frag_depth` 比较
- 如果测试通过：返回 `1.0` ，否则返回 `0.0`

比较的方法是：`uv` `CompareFunction` `frag_depth`

`CompareFunction` 就是在创建 Sampler 时，指定的操作符了，在此处，我们是 `CompareFunction::LessEqual` ，即，当 `uv <= frag_depth` 时，测试通过。

### 点光源 Omnidirectional Lights

对于点光源，则稍微有些复杂，我们不能直接投影来获取深度，因为我们不知道到底要用哪个 Light View 。

但是也有其他的办法，我是在 Bevy Engine 的源代码中看到的：

```rust
fn sample_point_shadow_map(light: u32, relative_pos: vec3f) -> f32 {
    // Find the axis with largest absolute value.
    let abs_pos = abs(relative_pos);
    let frag_depth = -max(abs_pos.x, max(abs_pos.y, abs_pos.z));

    // Do a simple projection.
    let proj = light_views[light].proj;
    let v = vec2f(frag_depth * proj[2][2] + proj[3][2], -frag_depth);
    let projected_depth = v.x / v.y;

    return textureSampleCompare(point_shadow_map, shadow_map_sampler, -relative_pos, light, projected_depth);
}
```

我们把整个立方体分成了 6 个三角锥（或者叫四面体，但是其实更准确地说，是 6 个棱台，因为每个视锥体是棱台而不是锥体，但是由于近平面足够近，可以近似看作锥体，不过这不重要hhhhh），显然，每个点相对于灯光的相对坐标 `relative_pos` 的绝对值最大的那个分量，就是深度。

之后我们构造一个虚拟的位置 `(0.0, 0.0, depth, 1.0)` ，将这个点投影到任意一个 Light View 上，就能得到裁剪空间下的深度。代码中是经过简化的，如果直接用 Projection Matrix 乘以这个位置，也是一样的效果。

> 那不同的 Light View 方向都不一样，随便选一个能对吗？

能，因为 Projection Matrix 与朝向无关。

## Shadow Acne

如果你此时直接运行，会发现在物体的表面，会有一些奇怪的黑色条纹，看上去像是自己给自己的投影。

![](https://oss.443eb9.dev/islandsmedia/16/shadow-acne.png)

那么很显然这是有问题的，这种现象被称为 Shadow Acne ，原因也很简单，浮点数在进行运算时，是会有误差的，解决方案也非常简单，只需要在我们计算出来的深度上稍作偏移：

```diff
fn sample_directional_shadow_map(light: u32, position_ws: vec3f) -> f32 {
    ...
-   let frag_depth = saturate(position_cs.z);
+   let frag_depth = saturate(position_cs.z) - 0.005;
    ...
}

fn sample_point_shadow_map(light: u32, relative_pos: vec3f) -> f32 {
    ...
-    let projected_depth = v.x / v.y;
+    let projected_depth = v.x / v.y - 0.001;
    ...
}
```

这样就大功告成啦！

## 结束？ Ending?

没啥好说的，放两张图就完了，好看，无需多盐（

![](https://oss.443eb9.dev/islandsmedia/16/directional.png)

![](https://oss.443eb9.dev/islandsmedia/16/point-and-spot.png)

## 进一步优化 Further Optimization

以为这就结束了？诶~当然没有，正片开始！

*由于这之前的内容和这之后的内容编写时，中间经历过一次重构，因此会有些许差别，但是不影响理解。~~总不能有人照抄代码吧不会吧不会吧？~~*

### 级联阴影贴图 Cascaded Shadow Map

还记得我们刚才在方向光处挖的坑吗？我们直接使用方向光自己的位置，会造成很严重的问题：当物体离方向光太远了，导致方向光的视锥体无法覆盖这个物体，那么阴影就消失了。

显然这也不可以通过无脑增大 Shadow Map 的尺寸和方向光的视锥体解决，那该怎么办呢？

对于我们看到的物体，他们都是在 Main View 的视锥体内的，也就是说，只要这些在视锥体内的物体能够在 PBR 时采样到正确的深度就可以了。

那么，是不是可以假象，方向光对应的 Light View 处在 Main View 视锥体的正中央，方向依旧是方向光本身的朝向，而 Projection Matrix 的边界，就是能完全包裹住整个 Main View 的最小的 AABB 呢？

我们先算出 Main View 的视锥体的每一个顶点在世界空间中的位置：

```rust
pub fn calculate_frustum_corners(view_proj: Mat4) -> [Vec3; 8] {
    let mut corners = [
        // Near Plane
        Vec3::new(1., 1., 0.),
        Vec3::new(-1., 1., 0.),
        Vec3::new(1., -1., 0.),
        Vec3::new(-1., -1., 0.),
        // Far Plane
        Vec3::new(1., 1., 1.),
        Vec3::new(-1., 1., 1.),
        Vec3::new(1., -1., 1.),
        Vec3::new(-1., -1., 1.),
    ];

    let mat = view_proj.inverse();
    corners.iter_mut().for_each(|c| {
        let clip = mat * c.extend(1.);
        *c = clip.xyz() / clip.w;
    });

    corners
}
```

计算出他中心的位置，用于放置 Light View ，并且和原来方向光的朝向一致。

*由于我这里用的 `light_dir` 是取过反的，所以这里得反回来。*

```rust
// The transform of this cascade should at center of that frustum.
let center = frustum_corners.into_iter().reduce(|v, c| v + c).unwrap()
    / frustum_corners.len() as f32;

// And looking at the light_dir.
// As we are having the inverse direction, which is only use for light calculation,
// inverse it back.
let cascade_view = Mat4::look_to_rh(center, -light_dir, Vec3::Y);
```

将 Main View 视锥体的全部顶点都转换到 Light View 空间下，计算 AABB

```rust
// Convert frustum into cascade view space.
frustum_corners
    .iter_mut()
    .for_each(|c| *c = (cascade_view * c.extend(1.)).truncate());

// Calculate the bounding box of the frustum in cascade view space.
let cascade_proj_aabb = frustum_corners.into_iter().fold(
    Aabb {
        min: Vec3::MAX,
        max: Vec3::MIN,
    },
    |mut aabb, c| {
        aabb.min = aabb.min.min(c);
        aabb.max = aabb.max.max(c);
        aabb
    },
);
let half_aabb_size = (cascade_proj_aabb.max - cascade_proj_aabb.min) * 0.5;
```

最后，因为 Light View 在 Main View 视锥体的正中央，因此其 Projection Matrix 的边界应该刚刚好每一对对立的面都是和 Light View 距离相等的，于是由这个 AABB 反推出 Projection Matrix

```rust
let cascade_proj = Mat4::orthographic_rh(
    -half_aabb_size.x,
    half_aabb_size.x,
    -half_aabb_size.y,
    half_aabb_size.y,
    -half_aabb_size.z,
    half_aabb_size.z,
);
```

完整函数：

```rust
pub fn calculate_cascade_view(
    camera_transform: Transform,
    camera_proj_slice: CameraProjection,
    light_dir: Vec3,
) -> GpuCamera {
    let view_proj =
        camera_proj_slice.compute_matrix() * camera_transform.compute_matrix().inverse();
    // Frustum corners in world space.
    let mut frustum_corners = util::calculate_frustum_corners(view_proj);

    // The transform of this cascade should at center of that frustum.
    let center = frustum_corners.into_iter().reduce(|v, c| v + c).unwrap()
        / frustum_corners.len() as f32;
    // And looking at the light_dir.
    // As we are having the inverse direction, which is only use for light calculation,
    // inverse it back.
    let cascade_view = Mat4::look_to_rh(center, -light_dir, Vec3::Y);

    // Convert frustum into cascade view space.
    frustum_corners
        .iter_mut()
        .for_each(|c| *c = (cascade_view * c.extend(1.)).truncate());

    // Calculate the bounding box of the frustum in cascade view space.
    let cascade_proj_aabb = frustum_corners.into_iter().fold(
        Aabb {
            min: Vec3::MAX,
            max: Vec3::MIN,
        },
        |mut aabb, c| {
            aabb.min = aabb.min.min(c);
            aabb.max = aabb.max.max(c);
            aabb
        },
    );
    let half_aabb_size = (cascade_proj_aabb.max - cascade_proj_aabb.min) * 0.5;

    let cascade_proj = Mat4::orthographic_rh(
        -half_aabb_size.x,
        half_aabb_size.x,
        -half_aabb_size.y,
        half_aabb_size.y,
        -half_aabb_size.z,
        half_aabb_size.z,
    );

    GpuCamera {
        view: cascade_view,
        proj: cascade_proj,
        position_ws: center,
        exposure: 0.,
    }
}
```

这样，我们就不需要再写死方向光的位置了

```rust
for (id, light) in &original.directional_lights {
    let view = Self::calculate_cascade_view(
        original.camera.transform,
        original.camera.projection,
        light.direction,
    );
    directional_desc.base_array_layer = directional_index;

    let texture_view_id = TextureViewId(Uuid::new_v4());
    assets.texture_views.insert(
        texture_view_id,
        directional_shadow_maps.create_view(&directional_desc),
    );

    // bf_cascade_views.push(&cascade_view);
    raw_cascade_views.extend_from_slice(bytemuck::bytes_of(&view));
    self.offsets.push(bf_light_views.push(&view));
    directional_index += 1;
    self.directional_views.insert(*id, texture_view_id);
}
```

*其中被注释掉的是因为内存布局的一些问题，如果你使用的图形 API 不管这个，或者引擎本身已经封装，那就该怎么向 Buffer 内添加元素就怎么添加。*

可以看到，此时我们不管如何移动摄像头，都可以正常看到阴影。

![](https://oss.443eb9.dev/islandsmedia/16/cascade-intro.png)

但是可以看到阴影的质量非常差，此时就是 Cascade 这个词真正出场了。

为了在节省资源的同时，尽可能使看到的阴影高质量，可以通过将 Main View 的视锥体分成好几份，每一份都生成这样的一份 Shadow Map 。

那么我们先来切一下 Main View 的视锥体，RTR 中提到，每一个 Cascade 的覆盖的深度应当是呈指对关系的，也就是一串等比数列，其中公比 $r=\sqrt[count]{\frac{far}{near}}$

```rust
pub fn frustum_slice(proj: CameraProjection, count: u32) -> Vec<CameraProjection> {
    match proj {
        CameraProjection::Perspective(proj) => {
            let r = (proj.far / proj.near).powf(1. / count as f32);
            let mut near = proj.near;

            (0..count)
                .map(|_| {
                    let far = near * r;
                    let p =
                        CameraProjection::Perspective(PerspectiveProjection { near, far, ..proj });
                    near = far;
                    p
                })
                .collect()
        }
        CameraProjection::Orthographic(proj) => {
            let r = (proj.far / proj.near).powf(1. / count as f32);
            let mut near = proj.near;

            (0..count)
                .map(|_| {
                    let far = near * r;
                    let p = CameraProjection::Orthographic(OrthographicProjection {
                        near,
                        far,
                        ..proj
                    });
                    near = far;
                    p
                })
                .collect()
        }
    }
}
```

但是这其实会导致一个问题，当近平面太近的时候，前几层会很浅很浅，不过这个可以通过一些 `clamp` 之类的手段解决，这里就不讨论了。

这样，我们就可以对每一份都生成一个 Light View

```rust
for (id, light) in &original.directional_lights {
    let cascade_views = sliced_frustums.clone().into_iter().map(|proj| {
        Self::calculate_cascade_view(original.camera.transform, proj, light.direction)
    });

    let mut cascade_maps = [TextureViewId::default(); Self::CASCADE_COUNT];

    for (i_cascade, cascade_view) in cascade_views.enumerate() {
        cascade_directional_desc.base_array_layer = directional_index;
        let texture_view_id = TextureViewId(Uuid::new_v4());
        cascade_maps[i_cascade] = texture_view_id;

        assets.texture_views.insert(
            texture_view_id,
            directional_shadow_maps.create_view(&cascade_directional_desc),
        );

        // bf_cascade_views.push(&cascade_view);
        raw_cascade_views.extend_from_slice(bytemuck::bytes_of(&cascade_view));
        self.offsets.push(bf_light_views.push(&cascade_view));
        directional_index += 1;
    }

    self.directional_views.insert(*id, cascade_maps);
}
```

那又出来一个新的问题：我怎么知道当前正在渲染的这个片元，到底是在 Main View 的哪个个切片里呢？我要使用哪一个 Light View 呢？

不难发现，我们的切片是按照深度值排列的，从近到远，因此，对于一个片元，只要知道他的深度，再反向遍历每一个 Light View ，如果其中一个 Light View 的近平面深度大于他的深度，那么就说明这个片元在这个切片内。

所以，把我们原来废弃的 `exposure` field 利用起来，存储近平面。

```diff
pub fn calculate_cascade_view(
    camera_transform: Transform,
    camera_proj_slice: CameraProjection,
    light_dir: Vec3,
) -> GpuCamera {
    
    ...

    GpuCamera {
        view: cascade_view,
        proj: cascade_proj,
        position_ws: center,
-        exposure: 0.,
+        // SPECIAL USE CASE!!
+        exposure: match camera_proj_slice {
+            CameraProjection::Perspective(proj) => proj.near,
+            CameraProjection::Orthographic(proj) => proj.near,
+        },
    }
}
```

然后再给采样的函数添加一个参数：`position_vs` ，用他的 `z` 分量来比较。

```rust
fn sample_cascaded_shadow_map(light: u32, position_ws: vec3f, position_vs: vec4f) -> f32 {
    for (var cascade = #SHADOW_CASCADES - 1u; cascade >= 0u; cascade -= 1u) {
        let index = light * #SHADOW_CASCADES + cascade;
        // SPECIAL USE CASE FOR exposure FIELD!!
        // exposure = near plane of this camera.
        // If this point is inside this frustum slice.
        if abs(position_vs.z) > abs(cascade_views[index].exposure) {
            // Project the mesh point on to light view.
            let position_cs = cascade_views[cascade].proj * cascade_views[index].view * vec4f(position_ws, 1.);
            let ndc = position_cs.xy / position_cs.w;
            var uv = (ndc + 1.) / 2.;
            uv.y = 1. - uv.y;

            if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
                let frag_depth = saturate(position_cs.z) - 0.01;
                return textureSampleCompare(directional_shadow_map, shadow_map_sampler, uv, cascade, frag_depth);
            } else {
                return 1.;
            }
        }
    }

    return 1.;
}
```

![](https://oss.443eb9.dev/islandsmedia/16/cascade.png)

可以很明显的看到，两个 Cascade 之间阴影质量的差距。*~~我知道这很丑（~~*

然后是一个可选项，为了方便观察，我们给在每一个不同的 Cascade 之间的片元额外加上一个颜色，这样看的会更清晰一些：

```rust
fn debug_cascade_color(light: u32, position_vs: vec4f) -> vec3f {
    var CASCADE_COLORS = array<vec3f, 6>(
        vec3f(1., 0., 0.),
        vec3f(0., 1., 0.),
        vec3f(0., 0., 1.),
        vec3f(1., 1., 0.),
        vec3f(1., 0., 1.),
        vec3f(0., 1., 1.),
    );

    for (var cascade = #SHADOW_CASCADES - 1u; cascade >= 0u; cascade -= 1u) {
        let index = light * #SHADOW_CASCADES + cascade;
        // SPECIAL USE CASE FOR exposure FIELD!!
        // exposure = near plane of this camera.
        // If this point is inside this frustum slice.
        if abs(position_vs.z) > abs(cascade_views[index].exposure) {
            return CASCADE_COLORS[cascade % 6];
        }
    }

    return vec3f(1.);
}
```

![](https://oss.443eb9.dev/islandsmedia/16/cascade-with-debug-color.png)

红色部分为第一层 Cascade ，绿色部分为第二层。我这里只分了两层，你也可以通过修改上文代码中的常量 `Self::CASCADE_COUNT` 来增加更多层数。（前提是你的代码没有写错（逃

### 滤波 Filtering

诶，好还没结束呢（（

上文一直在实现硬阴影，接下来我们希望这个阴影可以更自然更好看

#### PCF Percentage Closer Filtering

最简单最无脑的方法，在我们目标片元周围采一些样然后取平均值。我们在片元的 `position_vs` ，也就是 Light View 的 View 空间下，保持 `z` 不变，通过修改 `x,y` 分量来在周围采样。

```rust
fn pcf_filtering(position_vs: vec4f, cascade: u32) -> f32 {
    var shadow = 0.;
    for (var iteration = 0u; iteration < #SHADOW_SAMPLE_COUNT; iteration += 1u) {
        let offseted = position_vs + vec4f(poisson_disk[iteration], 0., 0.);
        let position_cs = cascade_views[cascade].proj * offseted;
        let ndc = position_cs.xy / position_cs.w;
        var uv = (ndc + 1.) / 2.;
        uv.y = 1. - uv.y;

        if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
            let frag_depth = saturate(position_cs.z) - 0.005;
            shadow += textureSampleCompare(directional_shadow_map, shadow_map_sampler, uv, cascade, frag_depth);
        } else {
            shadow += 1.;
        }
    }
    return shadow / f32(#SHADOW_SAMPLE_COUNT);
}

fn no_filtering(position_cs: vec4f, uv: vec2f, cascade: u32) -> f32 {
    let frag_depth = saturate(position_cs.z) - 0.002;
    return textureSampleCompare(directional_shadow_map, shadow_map_sampler, uv, cascade, frag_depth);
}

fn sample_directional_shadow_map(position_vs: vec4f, position_cs: vec4f, uv: vec2f, cascade: u32) -> f32 {
#ifdef PCF
    return pcf_filtering(position_vs, cascade);
#else
    return no_filtering(position_cs, uv, cascade);
#endif
}

fn sample_cascaded_shadow_map(light: u32, position_ws: vec3f, position_vs: vec4f) -> f32 {
    for (var cascade = #SHADOW_CASCADES - 1u; cascade >= 0u; cascade -= 1u) {
        let index = light * #SHADOW_CASCADES + cascade;
        // SPECIAL USE CASE FOR exposure FIELD!!
        // exposure = near plane of this camera.
        // If this point is inside this frustum slice.
        if abs(position_vs.z) > abs(cascade_views[index].exposure) {
            let position_vs = cascade_views[index].view * vec4f(position_ws, 1.);
            let position_cs = cascade_views[cascade].proj * position_vs;
            let ndc = position_cs.xy / position_cs.w;
            var uv = (ndc + 1.) / 2.;
            uv.y = 1. - uv.y;

            if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
                return sample_directional_shadow_map(position_vs, position_cs, uv, cascade);
            } else {
                return 1.;
            }
        }
    }

    return 1.;
}
```

这个 `poisson_disk` 是一种叫做 Poisson Disk Sampling 的采样方法的实现，或者说是从 CPU 预先计算好，送来 GPU 直接使用的采样点。

Poisson Disk Sampling 可以让不同采样点之间分布尽量均匀，之后可能会单独出一篇文章来讲这个东西。

不过毕竟每一次采样都是用的相同的偏移，还是会不可避免地出现一些奇怪的 Artifact 。其实可以用噪声来旋转这个 Poisson Disk 的 ~~，但是我懒（~~

![](https://oss.443eb9.dev/islandsmedia/16/pcf.png)

可以看到阴影变软了很多。

> 为什么第一层的地板看上去颜色深一点

因为 Shadow Acne 又回来了，如果凑近了看，可以发现是很细小的 Acne 在干扰图像品质。在滤波这一小节，我们暂时不管，这个问题，以及，也许你已经发现了，在摄像机角度较为刁钻的时候，部分阴影会消失，这个问题，我们都放到最后讲。

#### PCSS Percentage-Closer Soft Shadows

正在施工
