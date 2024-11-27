# 从零开始的渲染引擎-Aurora Chapter 4 屏幕空间环境光遮蔽 Screen Space Ambient Occlusion

参考
- *Real-time Rendering 4th Edition*
- [Bevy Engine](https://bevyengine.org/)
- [HBAO(屏幕空间的环境光遮蔽)](https://zhuanlan.zhihu.com/p/103683536)
- [LearnOpenGL - SSAO](https://learnopengl.com/Advanced-Lighting/SSAO)

嘛...相较于前面几章，这一章就比较水了，毕竟只讲了一个技术（

## 环境光遮蔽 Ambient Occlusion

$$
\int_{\boldsymbol{l}\in\Omega} L_A(\boldsymbol{n}\cdot\boldsymbol{l}^+)d\boldsymbol{l}
$$

这，是我们计算入射辐照度（irradiance）的方程，他认为在整个半球上的全部光线都是可以达到这个点的。

然而实际上并不如此，对于一个有凹凸的 Mesh 上面的某个点，很有可能有其他的平面挡住了一部分光照。

在之前的章节中，我们使用了阴影映射来解决了精准光源的阴影问题，环境光遮蔽，则是对整个环境光的阴影的近似。

$$
L_A\int_{\boldsymbol{l}\in\Omega} v(\boldsymbol{p},\boldsymbol{l})(\boldsymbol{n}\cdot\boldsymbol{l}^+)d\boldsymbol{l}
$$

此处的 $v$ 函数，描述了对于点 $\boldsymbol{p}$ ，从光照的方向 $\boldsymbol{l}$ 看过去，被遮挡了多少。从生活中的例子看，就是在一些细小的角落，阴影颜色会比开阔地带更深。从绘画的角度看，就是线稿的卡闭塞。

## Horizon-Based Ambient Occlusion

*对于后处理的介绍，请看下一章*

HBAO，一种屏幕空间的 AO 计算算法。

首先我们需要预先计算好深度和法线值，存储在材质里面之后再在这里使用。

![](https://oss.443eb9.dev/islandsmedia/20/normal-prepass.png)
![](https://oss.443eb9.dev/islandsmedia/20/depth-prepass.png)

> 此处深度值只截取了 0.99-1.0 的部分并映射到了 0-1 ，因为离摄像头实在是有点近，直接输出会看不清（逃</br>
> 另外，法线值在存储时映射到了 0-1 ，可被渲染的材质不支持有符号浮点数（ `U8Snorm` ）

1. 重构出当前坐标在 View Space 下的位置，以及 View Space 下的法线。

```rust

fn view_space_normal(uv: vec2f) -> vec3f {
    let normal_ws = textureSampleLevel(normal, tex_sampler, uv, 0.0).xyz;
    let view_mat = mat3x3f(
        camera.view[0].xyz,
        camera.view[1].xyz,
        camera.view[2].xyz,
    );
    return view_mat * (normal_ws * 2.0 - 1.0);
}

fn view_space_position(uv: vec2f) -> vec3f {
    let clip = vec2f(uv.x * 2.0 - 1.0, 1.0 - 2.0 * uv.y);
    let t = camera.inv_proj * vec4f(clip, frag_depth(uv), 1.0);
    return t.xyz / t.w;
}

fn view_space_depth(uv: vec2f) -> f32 {
    return -view_space_position(uv).z;
}

@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    let texel = id.xy;
    if any(id.xy >= config.texture_dim) {
        return;
    }
    let tex_sizef = vec2f(config.texture_dim);
    let uv = vec2f(texel) / tex_sizef;

    // Convert all data into view space.
    let texel_vs = view_space_position(uv);
    let normal_vs = view_space_normal(uv);

    // ...
}
```

2. 我们需要选取若干个角度，或者可以理解成，将采样的半球分成若干份，并且计算出这一份对应的采样角度。

```rust
@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    // ...

    for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
        // Get the direction of current slice, in view space.
        let angle = (f32(slice_index) / f32(config.slices)) * 2.0 * PI;
        let dir = vec2f(cos(angle), sin(angle));
        let dir3 = vec3f(dir, 0.0);

        // ...
    }

    // ...
}
```

3. 计算出当前采样的方向和这个位置的切线之间的夹角

```rust
// math.wgsl
fn sin_between(x: vec3f, y: vec3f) -> f32 {
    return length(cross(x, y)) / (length(x) * length(y));
}

fn project_vector_to_plane(v: vec3f, plane_normal: vec3f) -> vec3f {
    return v - dot(v, plane_normal) * plane_normal;
}

// --------------

// ...

for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
    // ...

    // Tangent angle, the angle between the sample direction and the tangent at this point
    // in view space.
    let sin_tangent_angle = math::sin_between(dir3, math::project_vector_to_plane(dir3, normal_vs));
    let tangent_angle = asin(sin_tangent_angle);

    // ...
}

// ...
```

4. 在每个角度上，往前步进若干步

```rust
@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    // ...

    for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
        // Get the direction of current slice, in view space.
        let angle = (f32(slice_index) / f32(config.slices)) * 2.0 * PI;
        let dir = vec2f(cos(angle), sin(angle));
        let dir3 = vec3f(dir, 0.0);

        for (var sample_index = 1u; sample_index <= config.samples; sample_index += 1u) {
            // March in the sample direction, in view space.
            
            // ...
        }
    }

    // ...
}
```

5. 步进的时候，记录当前采样点和原点之间的夹角的最大值

```rust
// ...

for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
    // ...

    // Horizon angle, the angle between the sample direction and the vector from point to
    // the highest point along this sample direction.
    var sin_horizon_angle = 0.0;
    // Tangent angle, the angle between the sample direction and the tangent at this point
    // in view space.
    let sin_tangent_angle = math::sin_between(dir3, math::project_vector_to_plane(dir3, normal_vs));
    let tangent_angle = asin(sin_tangent_angle);

    for (var sample_index = 1u; sample_index <= config.samples; sample_index += 1u) {
        // March in the sample direction, in view space.
        var planar_dist = f32(sample_index) * STEP_LENGTH;
        let sample_vs = texel_vs + dir3 * planar_dist;

        // Get the depth at this sample position.
        let sample_depth = view_space_depth(math::view_to_uv_and_depth(sample_vs, camera.proj).xy);

        // Height difference. We only cares about those points that are higher than the original
        // point, and they are closer to the camera, having lower value of depth.
        let diff = -texel_vs.z - sample_depth;
        let sin_angle = diff / sqrt(diff * diff + planar_dist * planar_dist);
        let horizon_angle = asin(sin_angle);
        
        // Find the highest point.
        if sin_angle > sin_horizon_angle && diff < config.max_depth_diff {
            let t = f32(sample_index - 1u) / f32(config.samples);
            let sample_weight = 1.0 - t * t;

            sin_horizon_angle = sin_angle;
        }
    }

    // ...
}

// ...
```

6. 计算 $AO=sin(h)-sin(t)$ ，也就是最高夹角的 sin 减去 切线夹角的 sin

```rust
// ...

for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
    // ...

    // Horizon angle, the angle between the sample direction and the vector from point to
    // the highest point along this sample direction.
    var sin_horizon_angle = 0.0;
    // Tangent angle, the angle between the sample direction and the tangent at this point
    // in view space.
    let sin_tangent_angle = math::sin_between(dir3, math::project_vector_to_plane(dir3, normal_vs));
    let tangent_angle = asin(sin_tangent_angle);

    for (var sample_index = 1u; sample_index <= config.samples; sample_index += 1u) {
        // March in the sample direction, in view space.
        var planar_dist = f32(sample_index) * STEP_LENGTH;
        let sample_vs = texel_vs + dir3 * planar_dist;

        // Get the depth at this sample position.
        let sample_depth = view_space_depth(math::view_to_uv_and_depth(sample_vs, camera.proj).xy);

        // Height difference. We only cares about those points that are higher than the original
        // point, and they are closer to the camera, having lower value of depth.
        let diff = -texel_vs.z - sample_depth;
        let sin_angle = diff / sqrt(diff * diff + planar_dist * planar_dist);
        let horizon_angle = asin(sin_angle);
        
        // Find the highest point.
        if sin_angle > sin_horizon_angle && diff < config.max_depth_diff {
            let t = f32(sample_index - 1u) / f32(config.samples);
            let sample_weight = 1.0 - t * t;

            sin_horizon_angle = sin_angle;
        }
    }

    ao += sin_horizon_angle - sin_tangent_angle;
}

// ...
```

7. 求平均值，然后存储进材质，随后 PBR 使用 uv 采样这张材质就可以了

```rust
    ao /= f32(config.slices * config.samples);
    ao = pow(1.0 - saturate(ao * config.strength), config.strength);

    textureStore(output, id.xy, vec4f(ao, 0.0, 0.0, 0.0));
```

~~如果不出意外的话，应该是出意外了，慢慢调试吧（~~

然后你应该可以看到这样的效果。

![](https://oss.443eb9.dev/islandsmedia/20/original.png)

可以看到很多奇怪的 Artifact ，我们先来尝试解决边缘的剧烈变化。

可以通过给 AO 加权解决。公式为 $W_{AO}+=W(S_1)AO(S_1)$ ，其中 $W_{AO}$ 初始值为 $0$ ，之后的 $W_{AO}+=S(S_2)(AO(S_2)-AO(S_1))$ 。 $W$ 是一个衰减函数：

$$
W=1-r^2
$$

```rust
for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
    // ...

    var weighted_ao = 0.0;
    var nonweighted_ao = 0.0;

    for (var sample_index = 1u; sample_index <= config.samples; sample_index += 1u) {
        // ...
        
        // Find the highest point.
        if sin_angle > sin_horizon_angle && diff < config.max_depth_diff {
            let t = f32(sample_index - 1u) / f32(config.samples);
            let sample_weight = 1.0 - t * t;

            sin_horizon_angle = sin_angle;
            weighted_ao += sample_weight * (sin_horizon_angle - sin_tangent_angle - nonweighted_ao);
            nonweighted_ao = sin_horizon_angle - sin_tangent_angle;
        }
    }

    ao += weighted_ao;
}
```

![](https://oss.443eb9.dev/islandsmedia/20/attenuated.png)

可以看到变化明显变缓和了，但是条带更严重了。这是因为每次我们都采样同一个方向，所以我们可以加点噪声。

```rust
@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    let randomness = hash::hash12u(texel) * 2.0 * PI;

    for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
        // Get the direction of current slice, in view space.
        let angle = ((f32(slice_index) + randomness) / f32(config.slices)) * 2.0 * PI;

        for (var sample_index = 1u; sample_index <= config.samples; sample_index += 1u) {
            // March in the sample direction, in view space.
            var planar_dist = (f32(sample_index) + randomness) * STEP_LENGTH;
        }

        ao += weighted_ao;
    }
}
```

![](https://oss.443eb9.dev/islandsmedia/20/white-noise.png)

嗯哼，没有奇怪的条带了，只剩下了带有噪声的信息，接下来，就可以对这个材质进行滤波了。我们选择 Bilateral Filtering ，可以保留 AO 的边缘，同时过滤掉高频噪声。

```rust
@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    let texel = id.xy;
    if any(texel >= config.texture_dim) {
        return;
    }
    let uv = vec2f(texel) / vec2f(config.texture_dim);

    let center = textureLoad(noisy_ao, vec2i(texel), 0).r;
    var sum = 0.0;
    var weight = 0.0;

    for (var dx = -2; dx <= 2; dx += 1) {
        for (var dy = -2; dy <= 2; dy += 1) {
            let v = vec2i(dx, dy);
            let x = textureLoad(noisy_ao, vec2i(texel) + v, 0).r;
            let dist = length(vec2f(v));
            let w = math::normal_distribution(dist, 0.0, 0.5) * math::normal_distribution(x - center, 0.0, 0.3);
            weight += w;
            sum += x * w;
        }
    }

    textureStore(filtered_ao, texel, vec4f(pow(sum / weight, f32(config.strength))));
}
```

![](https://oss.443eb9.dev/islandsmedia/20/filtered.png)

效果似乎不是很理想？还是可以看出一些噪声。

这是因为我们使用的是白噪声，白噪声在滤波后不容易被消除。使用蓝噪声可以很好避免。

这里参照 Bevy 使用 Hilbert R1 Blue Noise 。

```rust
pub fn generate_hilbert_lut(device: &Device, queue: &Queue) -> Texture {
    let mut t = [[0; 64]; 64];
    for x in 0..64 {
        for y in 0..64 {
            t[x][y] = Self::hilbert_index(x as u16, y as u16);
        }
    }

    device.create_texture_with_data(
        queue,
        &TextureDescriptor {
            label: Some("hilbert_lut"),
            size: Extent3d {
                width: HILBERT_WIDTH as u32,
                height: HILBERT_WIDTH as u32,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: TextureDimension::D2,
            format: TextureFormat::R16Uint,
            usage: TextureUsages::TEXTURE_BINDING,
            view_formats: &[],
        },
        Default::default(),
        bytemuck::cast_slice(&t),
    )
}

// Bevy
// https://www.shadertoy.com/view/3tB3z3
fn hilbert_index(mut x: u16, mut y: u16) -> u16 {
    let mut index = 0;

    let mut level: u16 = HILBERT_WIDTH / 2;
    while level > 0 {
        let region_x = (x & level > 0) as u16;
        let region_y = (y & level > 0) as u16;
        index += level * level * ((3 * region_x) ^ region_y);

        if region_y == 0 {
            if region_x == 1 {
                x = HILBERT_WIDTH - 1 - x;
                y = HILBERT_WIDTH - 1 - y;
            }

            std::mem::swap(&mut x, &mut y);
        }

        level /= 2;
    }

    index
}
```

随后在 Shader 内采样并应用

```rust
// math.wgsl
fn hilbert_curve_noise(index: u32) -> vec2f {
    // https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/
    return fract(0.5 + f32(index) * vec2<f32>(0.75487766624669276005, 0.5698402909980532659114));
}

// -------------------

@workgroup_size(#SSAO_WORKGROUP_SIZE, #SSAO_WORKGROUP_SIZE, 1)
@compute
fn main(@builtin(global_invocation_id) id: vec3u) {
    // ...

    let randomness = math::hilbert_curve_noise(textureLoad(hilbert_lut, texel % 64, 0).r);

    for (var slice_index = 0u; slice_index < config.slices; slice_index += 1u) {
        // Get the direction of current slice, in view space.
        let angle = ((f32(slice_index) + randomness.x) / f32(config.slices)) * 2.0 * PI;

        // ...
    }
}
```

![](https://oss.443eb9.dev/islandsmedia/20/blue-noise.png)

更好了一些！但是在一些曲面上，还是会出现条带状的 Artifact 。这是因为在曲面上，尽管曲面理论上应该是光滑的，但是还是会存在多个切面，导致互相之间错误的遮挡。

解决方案也很简单，使用一个 Angle Bias ，限制有效的遮挡角度即可。

```rust
// Find the highest point.
if sin_angle > sin_horizon_angle && horizon_angle > config.angle_bias && diff < config.max_depth_diff {
    // ...
}
```

![](https://oss.443eb9.dev/islandsmedia/20/angle-bias.png)

## 更进一步 Further

那么在现在的游戏中，更多的是使用 GTAO (Ground Truth Ambient Occlusion) ，并且在 Bevy 的实现中，使用了深度的差来保证边缘的形状。

总之还有很多可以做的。以后再说啦~

![](https://oss.443eb9.dev/islandsmedia/20/final.png)
