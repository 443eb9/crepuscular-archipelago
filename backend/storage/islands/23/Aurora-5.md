# 从零开始的渲染引擎-Aurora Chapter 5 基础后处理 Basic Post-processing

> The world was not wheeling anymore. It was just very clear and bright and inclined to blur at the edges. -- Ernest Hemingway

参考：
- *Real-time Rendering 4th Edition*
- [Bevy Engine](https://bevyengine.org/)
- [john-chapman-graphics: Pseudo Lens Flare](http://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html)
- [Chapter 28. Practical Post-Process Depth of Field](https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-28-practical-post-process-depth-field)
- [Hexagonal Bokeh Blur Revisited](https://colinbarrebrisebois.com/2017/04/18/hexagonal-bokeh-blur-revisited-part-1-basic-3-pass-version/)
- [LearnOpenGL - Phys. Based Bloom](https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom)
- [Bloom - CatlikeCoding](https://catlikecoding.com/unity/tutorials/advanced-rendering/bloom/)
- [Understanding Gamma Correction](https://www.cambridgeincolour.com/tutorials/gamma-correction.htm)
- [image - Formula to determine perceived brightness of RGB color - Stack Overflow](https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color)
- [Interleaved Gradient Noise: A Different Kind of Low Discrepancy Sequence « The blog at the bottom of the sea](https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/)
- [Circle of confusion - Wikipedia](https://en.wikipedia.org/wiki/Circle_of_confusion)

## 后处理 Post-processing

> Modifying the image after rendering is called post-processing --RTR 4th

所谓后处理，就是在渲染过后对于结果的进一步操作。不同于普通的图像处理，我们一般还会应用到其他数据，例如不同的 buffer ，深度，和法线信息。

在实际应用中，一般在顶点着色器种使用一个能够覆盖整个相机的三角形，覆盖住镜头后，计算出正确的 uv 。

就像这样子：

```
x---x---
|   | -
x---x
| -
-
```

对应成顶点着色器：

```rust
struct FullscreenVertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

@vertex
fn vertex(@builtin(vertex_index) vertex_index: u32) -> FullscreenVertexOutput {
    var output: FullscreenVertexOutput;
    let t = vec2f(f32(vertex_index / 2u), f32(vertex_index % 2u));
    output.position = vec4f(vec2f(t * 4. - 1.), 0., 1.);
    output.uv = t * 2.;
    output.uv.y = 1.0 - output.uv.y;
    return output;
}
```

这样，在额外实现的片元着色器中，就可以通过 uv 来获取当前像素的各种信息了。

此外，还可以使用 Compute Shader 进行计算，就像在上一章中， HBAO 算法的实现。

## 高动态范围 High Dynamic Range(HDR)

既然有高动态范围，那么也有低动态范围 (LDR) 。目前我们的渲染输出都是一张 `Rgba8UnormSrgb` 的图像上，他的每个像素的每一个通道的取值范围只有 255 种 ，他们被映射到 `0.0-1.0` 的范围内。对于超出范围的，那就只能被 clamp 到 `0.0-1.0` 的范围内了。

如果要使用高动态范围的渲染，也非常简单。

首先需要将输出的图像格式改为 `Rgba16Float` ，他的每一个像素的通道都是一个 16 位的浮点数，表示范围和精度远超使用一个字节存储的 `0.0-1.0` 的浮点数。

在之前的代码中，我们直接将 PBR 的结果进行 Tonemapping 然后输出：

```rust
return vec4f(tonemapping::tonemapping_tony_mc_mapface(color), 1.);
```

现在，不再需要 Tonemapping ，直接输出。

<div style="display: flex; gap: 2px;">
    <img src="https://oss.443eb9.dev/islandsmedia/23/hdr-example.png">
    <img src="https://oss.443eb9.dev/islandsmedia/23/ldr-example.png">
</div>

> 左：HDR 右：LDR

为了将 HDR 中 -inf~+inf 的数据映射到 `0.0-1.0` 上给显示器，就需要 Tonemapping 了，也就是说，我们需要把 Tonemapping 单独提出成为一个节点。这么做的好处，是我们可以对一张高动态范围的材质进行后处理，操作空间更大。

## 伽马校正 Gamma Correction

> 同样的场景，在 HDR 与 LDR 的渲染流程下，出现的结果好像不一样？

不完全正确，因为上面的 HDR 的图片是由 `Rgba16Float` 的材质直接 clamp 成 `Rgba8UnormSrgb` 的，没有任何其他处理。而 `Srgb` ，正是其中的关键。存储在 `Srgb` 材质中的颜色，会经历「伽马校正」。

人眼接收光照信息时，对于亮度的感知并不是线性的。如果把实际亮度设置为 `0%-100%` ，感知亮度 `0%-100%` ，摄像机在这个坐标系下的图像，应该是线性的，但人眼是一条突起的曲线。

为了尽可能校正这个差别，你的显示器会把颜色开 `2.2` 次方，（也可能是别的值，但是绝大多数情况下是 2.2），写成函数就是 `pow(color, 1 / 2.2)` ，然后再显示出来。这个 2.2 就被成为伽马 (Gamma) 。

进行矫正之后的图像，看上去就很正常。

更多信息，可以参考参考列表中提到的 [Understanding Gamma Correction](https://www.cambridgeincolour.com/tutorials/gamma-correction.htm) 一文。

知道了这些，就可以正式开始后处理了。

## 镜头光晕 Lens Flare

> A lens flare happens when light is scattered, or flared, in a lens system, often in response to a bright light, producing a sometimes undesirable artifact in the image. -- Wikipedia

~~虽然说是 undesirable ，但是我们正是要模拟这种效果（~~

随着科技的进步，这种 artifact 已经越来越不明显了，但是加上去可以让渲染的图像更有质感。

光晕的形状取决于光圈叶片的数目，数目越多，光晕就更趋于圆形。这里我们只做圆形的光晕。

首先，我们把渲染结果下采样，这样可以模拟出模糊的感觉。

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare-downsampled.png)

这里下采样到 1/3 。

之后，就可以对这一张材质采样，计算效果之后，根据 Alpha 通道的数值，混合回原来的材质。

```rust
let upsample_pipeline = device.create_render_pipeline(&RenderPipelineDescriptor {
    fragment: Some(FragmentState {
        module: &node.shaders[1],
        entry_point: "blit",
        compilation_options: Default::default(),
        targets: &[Some(ColorTargetState {
            format: targets.color_format,
            // Attention to the `blend` field here.
            blend: Some(BlendState {
                color: BlendComponent {
                    src_factor: BlendFactor::SrcAlpha,
                    dst_factor: BlendFactor::OneMinusSrcAlpha,
                    operation: BlendOperation::Add,
                },
                alpha: BlendComponent {
                    src_factor: BlendFactor::Zero,
                    dst_factor: BlendFactor::One,
                    operation: BlendOperation::Add,
                },
            }),
            write_mask: ColorWrites::ALL,
        })],
    }),
    ...
});
```

首先，由于光晕的位置和原光源的位置关于中心点中心对称，所以我们先计算一下对称过后的 uv ，然后采样。由于我们使用 Alpha 通道进行混合，所以这里的 Alpha 通道是有讲究的：

```rust
@fragment
fn lens_flare(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let flipped_uv = 1.0 - in.uv;
    let pixel = textureSample(color, color_sampler, flipped_uv).rgb;
    let luminance = math::luminance(math::linear_to_srgb(pixel));
    return vec4f(pixel, saturate(luminance));
}
```

我们计算这个像素点的亮度，然后用亮度来反应混合的权重。因为我们知道，光晕一定很亮，需要被混合，而其他地方很暗，不需要被混合。

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare-first-attempt.png)

hmmmm，效果不尽如人意，地面也被反射进来了。或许我们需要一个阈值？

`smoothstep` 函数了解一下。

这是文档中对于这个函数的定义：

> Overload 	
> 
> ```rust
> @const @must_use fn smoothstep(edge0: T, edge1: T, x: T) -> T
> ```
> 
> Parameterization: `S` is AbstractFloat, `f32`, or `f16`
> `T` is `S` or `vecN<S>`
> 
> Description: Returns the smooth *Hermite interpolation* between `0` and `1`. Component-wise when `T` is a vector.
> 
> For scalar `T`, the result is `t * t * (3.0 - 2.0 * t)`,
> where `t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)`.
> -- WebGPU Shading Language

简单来说，就是确定一个范围 `edge0 - edge1` ，把 `x` 作为一个混合的系数。
- 当 `x < edge0` ，返回 `0`
- 当 `edge0 < x < edge1` ，返回 `0 - 1` 之间的数值，具体取决于 `x` 的值
- 当 `x > edge1` ，返回 `1`

如果你还是不了解，可以看看 [The Book of Shaders](https://thebookofshaders.com/glossary/?search=smoothstep) 中的介绍。

```diff
@fragment
fn lens_flare(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let flipped_uv = 1.0 - in.uv;
    let pixel = textureSample(color, color_sampler, flipped_uv).rgb;
    let luminance = math::luminance(math::linear_to_srgb(pixel));
-   return vec4f(pixel, saturate(luminance));
+   return vec4f(pixel, smoothstep(config.lower_threshold, config.upper_threshold, luminance));
}
```

另外，我们还希望，对于处于画面中央的光源，他产生的光晕就更亮，所以可以做一个 falloff ：

```diff
@fragment
fn lens_flare(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let flipped_uv = 1.0 - in.uv;
-   let pixel = textureSample(color, color_sampler, flipped_uv).rgb;
+   let falloff = length(0.5 - flipped_uv) / length(vec2f(0.5));
+   let pixel = textureSample(color, color_sampler, flipped_uv).rgb * pow(1.0 - falloff, config.center_falloff);
    let luminance = math::luminance(math::linear_to_srgb(pixel));
    return vec4f(pixel, smoothstep(config.lower_threshold, config.upper_threshold, luminance));
}
```

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare-smoothstep-falloff.png)

看上去已经很像样了！再整点花活！

### 色差 Chromatic Aberration

色差的形成，同样是因为镜头和光的物体特性。不同波长的光在介质中折射时，偏转的角度是不同的，因此镜头组无法将光聚焦到同一个点上，就出现了色差。

这里给一个[维基百科的链接](https://en.wikipedia.org/wiki/Chromatic_aberration)~

模拟这种效果非常简单，只需要在采样每种通道的颜色的时候，对应偏移不同的量就行：

```rust
fn chromatic_aberration(uv: vec2f, dir: vec2f, strength: vec3f) -> vec3f {
    let r = textureSample(color, color_sampler, uv + dir * strength.r).r;
    let g = textureSample(color, color_sampler, uv + dir * strength.g).g;
    let b = textureSample(color, color_sampler, uv + dir * strength.b).b;
    return vec3f(r, g, b);
}
```

为了避免阅读 `diff` 混乱，这次贴一个完整代码：

```rust
@fragment
fn lens_flare(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let flipped_uv = 1.0 - in.uv;
    let texel = 1.0 / vec2f(textureDimensions(color));
    let dir = (vec2f(0.5) - flipped_uv) * texel;
    let falloff = length(0.5 - flipped_uv) / length(vec2f(0.5));

    var pixel = chromatic_aberration(flipped_uv, dir, vec3f(-config.ca_strength, 0.0, config.ca_strength)).rgb;
    pixel *= pow(1.0 - falloff, config.center_falloff);

    let luminance = math::luminance(math::linear_to_srgb(pixel));
    return vec4f(pixel, smoothstep(config.lower_threshold, config.upper_threshold, luminance));
}
```

可以看到在光晕周围已经出现别的颜色的圈圈了。~~（只不过我这个场景的光都是带颜色的就看起来效果不太好~~

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare-ca.png)

### 光环 Halo

不知道为什么会出现这个现象，但是看着挺有意思就加上吧（

写起来也是非常简单：

```rust
fn halo(uv: vec2f) -> vec3f {
    let dir = uv - vec2f(0.5);
    let dist = length(dir);
    let strength = pow(1.0 - abs(dist - config.halo_radius), 50.0);
#ifdef CHROMATIC_ABERRATION
    var col = chromatic_aberration(uv, dir / vec2f(textureDimensions(color)), vec3f(-config.ca_strength, 0.0, config.ca_strength));
#else // CHROMATIC_ABERRATION
    var col = textureSample(color, color_sampler, uv).rgb;
#endif // CHROMATIC_ABERRATION

    return col * strength;
}
```

然后，因为相机会出现一种叫 「[衍射尖峰](https://en.wikipedia.org/wiki/Diffraction_spike)」的东西，所以可以通过采样一张一维贴图，模拟光环的尖峰。

![](https://oss.443eb9.dev/islandsmedia/23/starburst.png)

衍射尖峰在天文学的照片中很常见：

![](https://oss.443eb9.dev/islandsmedia/23/james-webb.jpg)

> Original post: https://www.flickr.com/photos/nasawebbtelescope/54088897300/in/album-72177720313923911 Under *CC BY 2.0* License

这里贴一张詹姆斯·韦伯望远镜拍摄的照片，可以看到有很多尖峰。

```rust
fn startburst_factor(dir: vec2f) -> f32 {
    var angle = acos(math::cos_between_2d(dir, vec2f(1.0, 0.0)));
    if dir.y < 0.0 {
        angle += math::PI;
    }
    return textureSample(startburst_texture, color_sampler, angle / (2.0 * math::PI)).r;
}
```

```diff
fn halo(uv: vec2f) -> vec3f {
    let dir = uv - vec2f(0.5);
    let dist = length(dir);
    let strength = pow(1.0 - abs(dist - config.halo_radius), 50.0);
#ifdef CHROMATIC_ABERRATION
    var col = chromatic_aberration(uv, dir / vec2f(textureDimensions(color)), vec3f(-config.ca_strength, 0.0, config.ca_strength));
#else // CHROMATIC_ABERRATION
    var col = textureSample(color, color_sampler, uv).rgb;
#endif // CHROMATIC_ABERRATION

+ #ifdef STAR_BURST
+   col *= startburst_factor(dir);
+ #endif // STAR_BURST

    return col * strength;
}
```

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare-halo.png)

### 多重光晕 Multiple Flares

只有一个光斑看起来还是太单调了，我们可以尝试产生多个光斑。

逻辑很简单，采样多次，每次采样时，都将 uv 向中心移动一些。于是我们就得到了完整版的 Lens Flare ：

```rust
@fragment
fn lens_flare(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let dim = vec2f(textureDimensions(color));
    let texel = 1.0 / dim;
    let flipped_uv = 1.0 - in.uv;
    let centered_uv = flipped_uv * 2.0 - 1.0;
    let dir = (vec2f(0.5) - flipped_uv) * texel;

    var col = vec3f(0.0);

    for (var spot = 1; spot <= i32(config.spot_count); spot += 1) {
        // Scale the uv by `spot`.
        let sample_uv = centered_uv / f32(spot) * 0.5 + 0.5;

#ifdef CHROMATIC_ABERRATION
        let pixel = chromatic_aberration(sample_uv, dir / f32(spot), vec3f(-config.ca_strength, 0.0, config.ca_strength));
#else // CHROMATIC_ABERRATION
        let pixel = textureSample(color, color_sampler, sample_uv).rgb;
#endif // CHROMATIC_ABERRATION

        let falloff = length(vec2f(0.5) - sample_uv) / length(vec2f(0.5));
        var luminance = saturate(math::luminance(math::linear_to_srgb(pixel)));
        luminance = smoothstep(config.lower_threshold, config.upper_threshold, luminance);
        col += pixel * pow((1.0 - falloff), config.center_falloff) * vec3f(luminance);
    }

#ifdef HALO
    col += halo(flipped_uv);
#endif // HALO

    let luminance = math::luminance(math::linear_to_srgb(col));
    return vec4f(col, luminance);
}
```

![](https://oss.443eb9.dev/islandsmedia/23/lens-flare.png)

### 泛光 Bloom

在拍摄亮度极高的物体时（不要这么做，小心 CMOS 暴毙），物体周围往往会有泛出来的光。对，就是那个。

实现方法也极为简单，首先将图像下采样，之后上采样，最后混合。这一串的材质可以通过存入一个带有多层 mip 的材质中。

混合时，不可以直接每个下采样都以固定的值和上采样混合。

```rust
/// Calculates blend intensities of blur pyramid levels
/// during the upsampling + compositing stage.
///
/// The function assumes all pyramid levels are upsampled and
/// blended into higher frequency ones using this function to
/// calculate blend levels every time. The final (highest frequency)
/// pyramid level in not blended into anything therefore this function
/// is not applied to it. As a result, the *mip* parameter of 0 indicates
/// the second-highest frequency pyramid level (in our case that is the
/// 0th mip of the bloom texture with the original image being the
/// actual highest frequency level).
///
/// Parameters:
/// * `mip` - the index of the lower frequency pyramid level (0 - `max_mip`, where 0 indicates highest frequency mip but not the highest frequency image).
/// * `max_mip` - the index of the lowest frequency pyramid level.
///
/// This function can be visually previewed for all values of *mip* (normalized) with tweakable
/// [`BloomSettings`] parameters on [Desmos graphing calculator](https://www.desmos.com/calculator/ncc8xbhzzl).
fn compute_blend_factor(bloom_settings: &BloomSettings, mip: f32, max_mip: f32) -> f32 {
    let mut lf_boost = (1.0
        - (1.0 - (mip / max_mip)).powf(1.0 / (1.0 - bloom_settings.low_frequency_boost_curvature)))
        * bloom_settings.low_frequency_boost;
    let high_pass_lq = 1.0
        - (((mip / max_mip) - bloom_settings.high_pass_frequency)
            / bloom_settings.high_pass_frequency)
            .clamp(0.0, 1.0);
    lf_boost *= match bloom_settings.composite_mode {
        BloomCompositeMode::EnergyConserving => 1.0 - bloom_settings.intensity,
        BloomCompositeMode::Additive => 1.0,
    };

    (bloom_settings.intensity + lf_boost) * high_pass_lq
}
```

以上是 Bevy 0.14.1 对于 Bloom 中，各级 mip 的 blend factor 计算方式，简单来说就是，mip 从高到低（也就是分辨率从低到高），blend factor 先增高，后减少。

以下是我的简陋版（

```rust
pub fn calculate_blend_factor(&self, mip: usize) -> Color {
    let mip = mip as f32;
    let max_mip = self.data.as_ref().unwrap().texture_views.len() as f32 - 1.0;

    let BloomNodeConfig {
        intensity, scatter, ..
    } = self.config;

    let mut factor = (1.0 - (-(mip - max_mip / 2.0) / max_mip).abs()).powf(scatter);
    factor *= intensity;
    factor = factor.clamp(0.0, 1.0);

    let f = factor as f64;
    Color {
        r: f,
        g: f,
        b: f,
        a: f,
    }
}
```

在创建渲染管线时，需要注意，第一个下采样和最后一个上采样的管线需要单独创建，因为他们直接和输出绑定，材质格式可能会不同。

在下采样时，我们采样 13 个点，然后根据权重混合，就像 LearnOpenGl 里所描述的：

```rust
@fragment
fn downsample(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let uv = in.uv;
    // a - b - c
    // - j - k -
    // d - e - f
    // - l - m -
    // g - h - i

    let a = textureSample(color, color_sampler, uv, vec2i(-2, -2)).rgb;
    let b = textureSample(color, color_sampler, uv, vec2i( 0, -2)).rgb;
    let c = textureSample(color, color_sampler, uv, vec2i( 2, -2)).rgb;

    let d = textureSample(color, color_sampler, uv, vec2i(-2,  0)).rgb;
    let e = textureSample(color, color_sampler, uv).rgb;
    let f = textureSample(color, color_sampler, uv, vec2i( 2,  0)).rgb;

    let g = textureSample(color, color_sampler, uv, vec2i(-2,  2)).rgb;
    let h = textureSample(color, color_sampler, uv, vec2i( 0,  2)).rgb;
    let i = textureSample(color, color_sampler, uv, vec2i( 2,  2)).rgb;

    let j = textureSample(color, color_sampler, uv, vec2i(-1, -1)).rgb;
    let k = textureSample(color, color_sampler, uv, vec2i( 1, -1)).rgb;
    let l = textureSample(color, color_sampler, uv, vec2i(-1,  1)).rgb;
    let m = textureSample(color, color_sampler, uv, vec2i( 1,  1)).rgb;

    let col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
    return vec4f(col, 1.0);
}
```

在上采样时，使用一个 3x3 的 kernel ：

```rust
@fragment
fn upsample(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let uv = in.uv;
    // a - b - c
    // d - e - f
    // g - h - i
    let a = textureSample(color, color_sampler, uv, vec2i(-1, -1)).rgb;
    let b = textureSample(color, color_sampler, uv, vec2i( 0, -1)).rgb;
    let c = textureSample(color, color_sampler, uv, vec2i( 1, -1)).rgb;

    let d = textureSample(color, color_sampler, uv, vec2i(-1,  0)).rgb;
    let e = textureSample(color, color_sampler, uv).rgb;
    let f = textureSample(color, color_sampler, uv, vec2i( 1,  0)).rgb;
    
    let g = textureSample(color, color_sampler, uv, vec2i(-1,  1)).rgb;
    let h = textureSample(color, color_sampler, uv, vec2i( 0,  1)).rgb;
    let i = textureSample(color, color_sampler, uv, vec2i( 1,  1)).rgb;

    let col = e * 0.25 + (b + d + f + h) * 0.125 + (a + c + g + i) * 0.0625;
    return vec4f(col, 1.0);
}
```

但是这么做会有一个问题：

<video controls>
    <source src="https://oss.443eb9.dev/islandsmedia/23/bloom-firefly.mp4" type="video/mp4">
</video>

当一个极亮的像素频繁被遮挡和出现时，会出现 firefly ，直译为萤火虫。

解决方法是在第一次下采样时，进行 Karis Average 。这种平均方法会将亮度考虑在内，避免高亮度的个别像素影响过大。

```rust
fn karis_average(c: vec3f) -> f32 {
    let luma = math::luminance(math::linear_to_srgb(c)) * 0.25;
    return 1.0 / (1.0 + luma);
}

@fragment
fn downsample(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let uv = in.uv;
    // a - b - c
    // - j - k -
    // d - e - f
    // - l - m -
    // g - h - i

    // ...

#ifdef FIRST_DOWNSAMPLE
    var group0 = (a + b + d + e) * 0.03125;
    var group1 = (b + c + e + f) * 0.03125;
    var group2 = (d + e + g + h) * 0.03125;
    var group3 = (e + f + h + i) * 0.03125;
    var group4 = (j + k + l + m) * 0.125;
    group0 *= karis_average(group0);
    group1 *= karis_average(group1);
    group2 *= karis_average(group2);
    group3 *= karis_average(group3);
    group4 *= karis_average(group4);
    var col = group0 + group1 + group2 + group3 + group4;

#else // FIRST_DOWNSAMPLE
    let col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
#endif // FIRST_DOWNSAMPLE
    return vec4f(col, 1.0);
}
```

还有一种会引发亮度突变的现象，没有 firefly 那么炸眼睛，但是也很难看，就是突然的 cutoff 会让亮度变化不自然。这可以通过加上一个 Soft threshold 解决

```rust
fn soft_threshold(c: vec3f) -> vec3f {
    let f = bloom_config.precomputed_filter;
    let brightness = max(c.x, max(c.y, c.z));
    var soft = brightness - f.y;
    soft = clamp(soft, 0.0, f.z);
    soft = soft * soft * f.w;
    var contribution = max(soft, brightness - f.x);
    contribution /= max(brightness, 0.000001);
    return c * contribution;
}

@fragment
fn downsample(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let uv = in.uv;
    // a - b - c
    // - j - k -
    // d - e - f
    // - l - m -
    // g - h - i
    
    // ...

#ifdef FIRST_DOWNSAMPLE
    // ...
#ifdef SOFT_THRESHOLD
    col = soft_threshold(col);
#endif // SOFT_THRESHOLD

    // ...
    return vec4f(col, 1.0);
}
```

~~不知道为什么我这个截图没有办法捕获含有透明度的像素，无所谓了凑合着看看吧~~

![](https://oss.443eb9.dev/islandsmedia/23/bloom.png)

~~皇帝的新 Bloom~~

## 景深 Depth of Field (DOF)

景深是由于相机焦距固定，但是物体距离相机的距离不同，因此有些物体会在焦内，有些在焦外。

### Circle of Confusion (COC)

其中一种模拟景深的方法，也是我们这里采用的方法，是使用 COC 的思想。在相机近平面上，取一个点，他对应的物件如果不在焦内，那么这个点的颜色就会出现在其他地方，我们把最远的可能出现的地方的距离，称为 Circle of Confusion 。

他的计算方式也很简单，百科里就有写，只需要一些相似三角形即可。

```rust
fn calculate_coc_diameter(uv: vec2f) -> f32 {
    let dim = vec2f(textureDimensions(depth));
    let clip_z = textureLoad(depth, vec2i(uv * dim), 0);
    let z = min(config.max_depth, math::clip_depth_to_view(clip_z, camera.inv_proj));

    let d = config.coc_factor * abs(z - config.focal_distance) / (z * (config.focal_distance - config.focal_length));
    return min(config.max_coc_radius * 2.0, d * dim.y);
}
```

如果希望根据一个物理摄像机推出这些参数，可以参考 Bevy 的实现。

### Bokeh

日文版的「Blur」，就是 COC 产生的视觉效果。

一般来说，目前市场上的摄像机都会产生圆形的 bokeh ，因为这玩意也和光圈叶片的数量有关。之前的摄像机会产生六边形的 bokeh ，个人认为是更好看的，而且六边形的 bokeh 也是对 COC 的更精确的表示。

另一种就是高斯模糊了，对应现在市面上的，比较高端的摄像机。

### 高斯模糊版 DOF with Gaussian Blur

没什么好说的，计算出 COC 然后模糊一下。

值得注意的是，我们不使用两个 for loop 来进行满血的高斯模糊，因为他太慢了，如果是横着模糊一遍再竖着模糊一遍，看起来也是差不多的：

```rust
fn gaussian_blur(uv: vec2f, coc: f32, step_texel_offset: vec2f) -> vec4f {
    let sigma = coc * 0.25;
    let samples = i32(ceil(sigma * 1.5));
    let step_uv_offset = step_texel_offset / vec2f(textureDimensions(color));
    let exp_factor = -1.0 / (2.0 * sigma * sigma);

    var sum = textureSample(color, color_sampler, uv).rgb;
    var weight_sum = 1.0;

    for (var step = 1; step <= samples; step += 2) {
        let w0 = exp(exp_factor * f32(step) * f32(step));
        let w1 = exp(exp_factor * f32(step + 1) * f32(step + 1));
        let uv_offset = step_uv_offset * (f32(step) + w1 / (w0 + w1));
        let weight = w0 + w1;

        sum += (
            textureSampleLevel(color, color_sampler, uv + uv_offset, 0.0).rgb +
            textureSampleLevel(color, color_sampler, uv - uv_offset, 0.0).rgb
        ) * weight;
        weight_sum += weight * 2.0;
    }

    return vec4f(sum / weight_sum, 1.0);
}

@fragment
fn gaussian_horizontal(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let coc = calculate_coc_diameter(in.uv);
    return gaussian_blur(in.uv, coc, vec2f(1.0, 0.0));
}

@fragment
fn gaussian_vertical(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let coc = calculate_coc_diameter(in.uv);
    return gaussian_blur(in.uv, coc, vec2f(0.0, 1.0));
}
```

对于高斯模糊函数中奇怪的采样方法， Bevy 的源码中有解释：

```
// This is a well-known trick to reduce the number of needed texture
// samples by a factor of two. We seek to accumulate two adjacent
// samples c₀ and c₁ with weights w₀ and w₁ respectively, with a single
// texture sample at a carefully chosen location. Observe that:
//
//     k ⋅ lerp(c₀, c₁, t) = w₀⋅c₀ + w₁⋅c₁
//
//                              w₁
//     if k = w₀ + w₁ and t = ───────
//                            w₀ + w₁
//
// Therefore, if we sample at a distance of t = w₁ / (w₀ + w₁) texels in
// between the two texel centers and scale by k = w₀ + w₁ afterward, we
// effectively evaluate w₀⋅c₀ + w₁⋅c₁ with a single texture lookup.
```

奇怪的知识增加了（

![](https://oss.443eb9.dev/islandsmedia/23/dof-gaussian.png)

### 六边形版 DOF with Hexagon Bokeh

六边形版的模糊，也是根据 COC 的大小，只不过他的模糊的方向和高斯模糊有所不同。

首先，他先往垂直和斜过来的方向模糊，再在另一个斜过来的方向模糊。

好吧听着很抽象，直接看代码吧：

```rust
struct HexagonMrtOutput {
    @location(0) vert: vec4f,
    @location(1) diag: vec4f,
}

fn blur_texture_a(uv: vec2f, coc: f32, step_texel_offset: vec2f) -> vec4f {
    var sum = vec3f(0.0);
    let samples = i32(round(coc * 0.5));
    let step_uv_offset = step_texel_offset / vec2f(textureDimensions(color));

    for (var step = 0; step <= samples; step += 1) {
        sum += textureSampleLevel(color, color_sampler, uv + step_uv_offset * f32(step), 0.0).rgb;
    }

    return vec4f(sum / vec3f(f32(samples + 1)), 1.0);
}

fn blur_texture_b(uv: vec2f, coc: f32, step_texel_offset: vec2f) -> vec4f {
    var sum = vec3f(0.0);
    let samples = i32(round(coc * 0.5));
    let step_uv_offset = step_texel_offset / vec2f(textureDimensions(color_another));

    for (var step = 0; step <= samples; step += 1) {
        sum += textureSampleLevel(color_another, color_sampler, uv + step_uv_offset * f32(step), 0.0).rgb;
    }

    return vec4f(sum / vec3f(f32(samples + 1)), 1.0);
}

const COS_NEG_FRAC_PI_6: f32 = 0.8660254037844387;
const SIN_NEG_FRAC_PI_6: f32 = -0.5;
const COS_NEG_FRAC_PI_5_6: f32 = -0.8660254037844387;
const SIN_NEG_FRAC_PI_5_6: f32 = -0.5;

@fragment
fn blur_vert_and_diag(in: FullscreenVertexOutput) -> HexagonMrtOutput {
    let coc = calculate_coc_diameter(in.uv);
    let vertical = blur_texture_a(in.uv, coc, vec2f(0.0, 1.0));
    let diagonal = blur_texture_a(in.uv, coc, vec2f(COS_NEG_FRAC_PI_6, SIN_NEG_FRAC_PI_6));

    var output: HexagonMrtOutput;
    output.vert = vertical;
    output.diag = mix(vertical, diagonal, 0.5);
    return output;
}

@fragment
fn blur_rhomboid(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let coc = calculate_coc_diameter(in.uv);
    let output_0 = blur_texture_a(in.uv, coc, vec2(COS_NEG_FRAC_PI_6, SIN_NEG_FRAC_PI_6));
    let output_1 = blur_texture_b(in.uv, coc, vec2(COS_NEG_FRAC_PI_5_6, SIN_NEG_FRAC_PI_5_6));
    return mix(output_0, output_1, 0.5);
}
```

可以理解成在那个点上，把材质涂抹开来，第一次涂抹出

```
 /
·
|
```

第二次涂抹出

```
\ /
 ·
```

这里使用到了 MRT(Multiple Render Target) 需要对应平台支持。当然你也可以分成 3 个 pass ，将第一步的两次涂抹分开来。

![](https://oss.443eb9.dev/islandsmedia/23/dof-hexagon.png)

## 运动模糊 Motion Blur

~~运动模糊，一个大部分玩家进游戏第一步就关掉的东西。~~

运动模糊的产生，是因为物体在摄像机曝光的时间内发生了位移。

那么，我们就可以先去计算这个位移，缓存起来。

怎么计算呢？

这种位移分为两种。

第一种，摄像机在动，物体不动，这种情况下，需要获取上一帧摄像机的 view 矩阵和这一帧的，同样的物体的世界坐标，在相机的 view 空间下位置不同，相减即可得到 motion vector 。

第二种，摄像机不动，物体在动，同理，获取上一帧物体的 model 矩阵和这一帧的，在相机 view 空间下的位移。

诶那你要问如果两者都在动呢？不是哥们，这里的本质其实就是上一帧的物体在上一帧的摄像机 view 空间中的位置 到 这一帧的物体在这一帧的摄像机 view 空间中的位置 的位移。

```rust
struct MotionVectorPrepassConfig {
    previous_view: mat4x4f,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<uniform> config: MotionVectorPrepassConfig;

struct MotionVectorPrepassVertexOutput {
    @builtin(position) position: vec4f,
    @location(0) current_position: vec4f,
    @location(1) previous_position: vec4f,
}

@vertex
fn vertex(in: VertexInput) -> MotionVectorPrepassVertexOutput {
    let current = camera.view * vec4f(in.position, 1.0);
    let previous = config.previous_view * vec4f(in.position, 1.0);

    var out: MotionVectorPrepassVertexOutput;
    out.position = camera.proj * current;
    out.current_position = out.position;
    out.previous_position = camera.proj * previous;
    return out;
}

@fragment
fn fragment(in: MotionVectorPrepassVertexOutput) -> @location(0) vec4f {
    let uv = math::clip_to_uv(in.current_position);
    let previous_uv = math::clip_to_uv(in.previous_position);
    return vec4f((uv - previous_uv) * 2.0, 0.0, 0.0);
}
```

使用屏幕空间的位移，可以用一张 `Rg16Float` 的材质来存储。在这里，因为我的应用场景中，模型不会移动，因此只考虑了相机的移动。

![](https://oss.443eb9.dev/islandsmedia/23/motion-vector.png)

> 值被映射到 `0.0-0.2` 的 Motion Vector 材质

本身的算法也是非常简单，只需要根据运动的方向进行模糊即可。

```rust
@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4f {
    let motion = textureSample(motion_vector, motion_vector_sampler, in.uv).rg;

    let dim = vec2f(textureDimensions(color));
    let noise = math::interleaved_gradient_noise(dim * in.uv, config.frame);

    var col = textureSample(color, color_sampler, in.uv);
    for (var i = 0; i < i32(config.samples); i += 1) {
        let delta = (motion * (f32(i) + noise) * config.strength) / f32(config.samples);
        col += textureSample(color, color_sampler, in.uv - delta);
    }

    let weight = f32(config.samples + 1);
    return col / weight;
}
```

如果模型会移动，那么这里模糊的时候需要稍微注意一下：如果前景的物体在高速运动，相机相对于这个高速运动的物体静止（换句话说，相机和这个物体保持相同速度大小和方向一起运动），那被模糊的应该是背景而不是前景。

更通用地说，模糊的时候，需要考虑物体之间的分离。

我们可以通过深度，或者像 Bevy 中的，使用速度来判断是不是同一个物体。如果不是同一个，那就不应该将其考虑在内。此处不做实现 ~~（因为我懒~~

![](https://oss.443eb9.dev/islandsmedia/23/motion-blur.png)

> 截图截出来看着有点太夸张了不知道为什么，实际上是没有那么模糊的。

> 里面那个 `interleaved_gradient_noise` 是什么？为什么要加这个东西？

诶问得好

### Interleaved Gradient Noise (IGN)

~~IGN？好吧不是那个 IGN~~

Why interleaved gradient noise, but not blue Noise, or white noise?

（留个坑，之后填

## Ending

受限于场景，一些效果没法展示。之后有机会重新拍一张。

~~写到这里了才发现 Tonemapping 一直没开，无所谓就是上面的截图看着稍微丑点，底下这张全家福是开了的~~

![](https://oss.443eb9.dev/islandsmedia/23/final.png)
