---
title: 从零开始的渲染引擎-Aurora Chapter 1
subtitle: 使用WGPU的具体实现 Implementation Using WGPU
desc: 第一章，介绍使用WGPU进行的具体实现。主要是Shader编写，以及其他有关光照的细节，比如光强度的单位，光的衰减，曝光等等。
ty: article
date: 2024-06-11T15:03:10.000+08:00
banner: true
tags: 图形学,Shader
---

# 从零开始的渲染引擎-Aurora Chapter 1 使用WGPU的具体实现 Implementation In WGPU

> *You can't do better design with a computer, but you can speed up your work enormously.* --Wim Crouwel

*所以你堆shi山也没关系（逃*

参考：
- *Real-time Rendering 4th Edition*
- Google [*Filament*](https://google.github.io/filament/Filament.html)
- [Bevy Engine](https://bevyengine.org/)
- [Primer on Color Science - nth](https://hackmd.io/b23Fc_NiScOW6aT58u0e1A#)
- [Tone Mapping - @64](https://64.github.io/tonemapping/)

## Pbr材质 Pbr Material

根据Filament的材质模型，材质可以由以下属性组成（不包含clear coat模型）

| 属性   | 字段          | 类型   |
| ------ | ------------- | ------ |
| 反射率 | $albedo$      | `Vec3` |
| 粗糙度 | $roughness$   | `f32`  |
| 金属度 | $metallic$    | `f32`  |
| 反射度 | $reflectance$ | `f32`  |

其中，反射率指对于各波长的光的反射率，在实际应用中就是材料的固有色，此处我们更名为 $base\_color$ 。

这些属性都可以通过材质的方式传递，因此我们的实现中，反射率的输入还可以使用材质。（别的也可以，但是我懒得写）

那么来创建我们的材质吧

```rust
pub struct PbrMaterial {
    pub base_color: Srgb,
    // Here, Uuid is a unique identifier for resources used in Aurora.
    pub tex_base_color: Option<Uuid>,
    pub tex_normal: Option<Uuid>,
    pub roughness: f32,
    pub metallic: f32,
    pub reflectance: f32,
}
```

有一点值得注意的是，我们这里使用的颜色是SRGB的，在传递进Shader前，需要转换到线性RGB，所有与颜色有关的运算都应该在线性空间下进行。

## 光源 Light Source

目前我们只讨论三种光源：方向光(Directional Light)，点光源(Point Light)，聚光灯(Spot Light)。

### 光度学单位 Photometric Units

| Photometric term    | Notation | Unit                              |
| ------------------- | -------- | --------------------------------- |
| Luminous power      | $\Phi$   | Lumen ($lm$)                      |
| Luminous intensity  | $I$      | Candela ($cd$) or $\frac{lm}{sr}$ |
| Illuminance         | $E$      | Lux ($lx$) or $\frac{lm}{m^2}$    |
| Luminance           | $L$      | Nit ($nt$) or $\frac{cd}{m^2}$    |
| Radiant power       | $\Phi_e$ | Watt ($W$)                        |
| Luminous efficacy   | $\eta$   | Lumens per watt ($\frac{lm}{W}$)  |
| Luminous efficiency | $V$      | Percentage (%)                    |

> 光度学单位表 *Google Filament*

| Photometric term    | 光度学术语           | 含义                                                                                 |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| Luminous power      | 发光功率（光通量）   | 光在单位时间内所做的功                                                               |
| Luminous intensity  | 发光强度             | 光源给定方向上单位立体角内发光强弱程度                                               |
| Illuminance         | 照度                 | 每单位面积所接收到的光通量                                                           |
| Luminance           | 亮度                 | 人眼对发光体或被照射物体表面的发光或反射光强度实际感受（单位面积内看上去有多亮）     |
| Radiant power       | 辐射功率（辐射通量） | 单位时间内通过某一面积的所有电磁辐射（包括红外、紫外和可见光）总功率                 |
| Luminous efficacy   | 发光效率             | 光通量与功率的比值，依照文字来源此功率指的是光源输出的辐射通量，或者是提供光源的电能 |
| Luminous efficiency | （好像没有）         | 光通量与功率的比值再除以683，也就是最大可能的效率                                    |

晕了吗，啊哈没关系，因为我也搞不清楚（逃

### 衰减 Attenuation

#### 方向光 Directional Light

对于方向光，它可以辐射到表面的光强度不会因距离衰减，因此它的单位应当就是表面接受到的光强度的单位，也就是勒克斯(Lux)。方向光照到的表面，其亮度为

$$
L_{o}=f_{BSDF}E
$$

实现方向光：

```rust
pub struct DirectionalLight {
    pub transform: Transform,
    pub color: Srgb,
    pub intensity: f32,
}
```

```rust
for (var i_light = 0u; i_light < arrayLength(&dir_lights) - 1u; i_light += 1u) {
    let light = &dir_lights[i_light];
    color += pbr_function::apply_lighting((*light).direction, (*light).intensity, (*light).color, &unlit);
}
```

*为什么循环要-1不用管，具体原因写在代码里。*

#### 点光源 Point Light

对于精准光(Punctual Light)，它是会衰减的，且遵循平方反比，因此我们只能描述它的发光强度，也就是流明(Lumen)。

对于点光源的发光功率，可以通过在单位球上对其发光强度积分：

$$
\Phi = \int_{\Theta} Id\boldsymbol{l} = 4\pi I \\
I = \frac{\Phi}{4\pi}
$$

在应用上平方反比定律：

$$
I = \frac{\Phi}{4\pi d^2}
$$

实现点光源：

```rust
pub struct PointLight {
    pub transform: Transform,
    pub color: Srgb,
    pub intensity: f32,
}
```

```rust
for (var i_light = 0u; i_light < arrayLength(&point_lights) - 1u; i_light += 1u) {
    let light = &point_lights[i_light];
    let position_rel = (*light).position - input.position_ws;
    let direction = normalize(position_rel);
    let d2 = max(dot(position_rel, position_rel), 0.0001);
    
    let intensity = (*light).intensity / (4. * PI * d2);
    color += pbr_function::apply_lighting(direction, intensity, (*light).color, &unlit);
}
```

#### 聚光灯 Spot Light

对于聚光灯，它还有三个参数 $spotDir$ ， $inner$ 和 $outer$ ，在 $inner$ 内的，只受到距离的影响，在 $inner$ 到 $outer$ 之间的，除了受到距离的影响，还会受到额外的falloff，直到到 $outer$ 外，就没有亮度了。 $spotDir$ 就是用来计算falloff的一部分。

对于它的发光功率，同样可以在一个球面上积分，不过它的最大仰角只到 $outer$ 。公式内的 $\theta$ 就是 $outer$ ：

$$
\Phi = \int_{\Theta} Id\boldsymbol{l} = \int_{0}^{2\pi}\int_{0}^{\theta}Id\boldsymbol{\theta}d\boldsymbol{\phi}=2\pi(1-\cos\frac{\theta}{2})I \\
I = \frac{\Phi}{2\pi(1-\cos\frac{\theta}{2})}
$$

Filament中还额外讨论了，当光投射到一个完美的吸收光的表面时，

$$
I = \frac{\Phi}{\pi d^2}
$$

还需要考虑在 $inner$ 和 $outer$ 之间的falloff：

$$
\lambda(\boldsymbol{l})=\frac{\boldsymbol{l}\cdot spotDir-\cos\theta_{outer}}{\cos\theta_{inner}-\cos\theta_{outer}}
$$

实现聚光灯：

```rust
pub struct SpotLight {
    pub transform: Transform,
    pub color: Srgb,
    pub intensity: f32,
    pub inner_angle: f32,
    pub outer_angle: f32,
}
```

```rust
for (var i_light = 0u; i_light < arrayLength(&spot_lights) - 1u; i_light += 1u) {
    let light = &spot_lights[i_light];
    let position_rel = (*light).position - input.position_ws;
    let direction = normalize(position_rel);
    let d2 = max(dot(position_rel, position_rel), 0.0001);

    let cos_outer = cos((*light).outer);
    let cos_inner = cos((*light).inner);

    let lambda = max(0., dot(direction, (*light).direction) - cos_outer) / (cos_inner - cos_outer) / PI;

    let intensity = (*light).intensity / (2. * PI * (1. - cos((*light).outer / 2.)) * d2) * lambda;
    color += pbr_function::apply_lighting(direction, intensity, (*light).color, &unlit);
}
```

## 重映射 Remapping

Filament的文档中提到，$metallic$ 和 $reflectance$ 都是会对材质的其他属性产生影响的。

对于 $base\_color$ ：

$$
base\_color=(1-metallic)*base\_color
$$

![](https://oss.443eb9.dev/islandsmedia/7/metallic-variance.png)

对于 $F_0$ ，也就是 `f_normal` （代码还没贴出来，别急）：

$$
F_0=0.16(1-metallic)reflectance^2+metallic*base\_color
$$

前面一项是对于绝缘体的，后面一项是对于导体的，然后使用 $metallic$ 插值，得到最终的 $F_0$

![](https://oss.443eb9.dev/islandsmedia/7/reflectance-variance.png)

对于 $roughness$ ，材质中填写的是感知上的 $roughness$ ，而非Shader真正参与运算的 $roughness$ 。二者之间关系为：

$$
roughness=perceptualRoughness^2
$$

## <u>反射方程</u> Reflectance Equation

让我们再来观察一下Reflectance Equation（的近似版）

$$
L_{o} \approx \pi f(\boldsymbol{l},\boldsymbol{v})c_{light}(\boldsymbol{n}\cdot\boldsymbol{l})^+
$$

其中的BRDF可拆分为多项，此处我们只考虑高光与漫反射项：

$$
f(\boldsymbol{l},\boldsymbol{v}) = f_{spec}(\boldsymbol{l},\boldsymbol{v})+f_{diff}(\boldsymbol{l},\boldsymbol{v})
$$

并且采用GGX Distribution作为高光，Burley提出的模型作为漫反射，Schlick的近似作为菲涅尔反射：

$$
f_{spec}(\boldsymbol{l},\boldsymbol{v})=\frac{\boldsymbol{F(\boldsymbol{h},\boldsymbol{l})G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{h}),D(\boldsymbol{h})}}{4|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|} \\
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})\alpha_g^2}{\pi(1+(\boldsymbol{n}\cdot\boldsymbol{m})^2(\alpha_g^2-1))^2} \\
\frac{G_2(\boldsymbol{l},\boldsymbol{v})}{4|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|} \approx \frac{0.5}{\mu_o\sqrt{\alpha^2+\mu_i(\mu_i-\alpha^2\mu_i)}+\mu_i\sqrt{{\alpha^2+
\mu_o(\mu_o-\alpha^2\mu_o)}}} \\
F(\boldsymbol{n},\boldsymbol{l}) \approx F_0 + (F_{90} - F_0)(1 - (\boldsymbol{n}\cdot\boldsymbol{l})^+)^{\frac{1}{p}}
$$

$$
f_{diff}=F(f_0,\boldsymbol{l})F(f_0,\boldsymbol{v}) \\
f_0=0.5+2\alpha(\boldsymbol{h}\cdot\boldsymbol{l})^2
$$

然后抄一下公式到Shader：

```rust
struct BrdfSurfaceUnlit {
    base_color: vec3f,
    roughness: f32,
    metallic: f32,

    normal: vec3f,
    view: vec3f,

    f_normal: vec3f,

    NdotV: f32,
}

struct BrdfSurfaceLit {
    light: vec3f,
    half: vec3f,

    NdotL: f32,
    NdotH: f32,
    HdotL: f32,
}

// GGX NDF
fn D_GGX(unlit: ptr<function, BrdfSurfaceUnlit>, lit: ptr<function, BrdfSurfaceLit>) -> f32 {
    let r2 = (*unlit).roughness * (*unlit).roughness;
    let den = 1. + (*lit).NdotH * (*lit).NdotH * (r2 - 1.);
    return r2 / (PI * den * den);
}

// Fresnel Reflectance
// Schlick approximation
fn F_Schlick(HdotL: f32, f_normal: vec3f) -> vec3f {
    return f_normal + (1. - f_normal) * pow(1. - HdotL, 5.);
}

// Simplified by Lagarde
// Notice this has already combined the denominator of specular BRDF.
fn G2_HeightCorrelated(unlit: ptr<function, BrdfSurfaceUnlit>, lit: ptr<function, BrdfSurfaceLit>) -> f32 {
    let r2 = (*unlit).roughness * (*unlit).roughness;
    let NdotL = (*lit).NdotL;
    let NdotV = (*unlit).NdotV;
    let l = NdotV * sqrt(r2 + NdotL * (NdotL - r2 * NdotL));
    let v = NdotL * sqrt(r2 + NdotV * (NdotV - r2 * NdotV));
    return 0.5 / (l + v);
}

fn FD_Burley(unlit: ptr<function, BrdfSurfaceUnlit>, lit: ptr<function, BrdfSurfaceLit>) -> vec3f {
    let f = 0.5 + 2. * (*unlit).roughness * (*lit).HdotL * (*lit).HdotL;
    let l = F_Schlick((*lit).NdotL, f);
    let v = F_Schlick((*unlit).NdotV, f);
    return l * v / PI;
}
```

由于某些属性需要映射和提前计算，因此定义 `BrdfSurfaceLit` 和 `BrdfSurfaceUnlit` ，并使用各种信息提前计算：


```rust
// Construct a BrdfSurface WITHOUT light related info.
fn construct_surface_unlit(
    position: vec3f,
    normal: vec3f,
    uv: vec2f,
    material: PbrMaterial,
) -> BrdfSurfaceUnlit {
    var surface: BrdfSurfaceUnlit;

    surface.roughness = material.roughness * material.roughness;
    surface.metallic = saturate(material.metallic);
    surface.base_color = (1. - surface.metallic) * material.base_color * textureSample(tex_base_color, tex_sampler, uv).rgb;
    
    surface.normal = normal;
    surface.view = normalize(camera.position - position);

    surface.f_normal = mix(vec3f(0.16 * material.reflectance * material.reflectance), surface.base_color, surface.metallic);

    surface.NdotV = saturate(dot(surface.normal, surface.view));

    return surface;
}

// Construct a BrdfSurface WITH light related info.
fn construct_surface_lit(light: vec3f, unlit: ptr<function, BrdfSurfaceUnlit>) -> BrdfSurfaceLit {
    var surface: BrdfSurfaceLit;

    surface.light = light;
    surface.half = normalize(surface.light + (*unlit).view);
    
    surface.NdotL = saturate(dot((*unlit).normal, surface.light));
    surface.NdotH = saturate(dot((*unlit).normal, surface.half));
    surface.HdotL = saturate(dot(surface.half, surface.light));

    return surface;
}
```

理论上来讲，光源方向向量 $\boldsymbol{l}$ 应当是由顶点指向光源的，因此注意传入 `construct_surface_lit` 的 `light` 的方向！

最后组合起来，应用光照：

```rust
fn apply_lighting(
    direction: vec3f,
    intensity: f32,
    color: vec3f,
    unlit: ptr<function, BrdfSurfaceUnlit>
) -> vec3f {
    var lit = construct_surface_lit(direction, unlit);

    let D = D_GGX(unlit, &lit);
    let G = G2_HeightCorrelated(unlit, &lit);
    let FD = FD_Burley(unlit, &lit);
    let F = F_Schlick(lit.HdotL, (*unlit).f_normal);

    let f_spec = D * G * F * PI;
    let f_diff = FD * PI;

    return lit.NdotL * intensity * (f_spec + f_diff) * color;
}
```

## 从场景到屏幕 Scene to Screen

也许你已经注意到了，我们在 `apply_lighting` 函数内，直接将 `intensity` 乘给了光源颜色 `color` 。如果直接输出颜色到屏幕，那...想想都知道得有多白。

算了不要想了，直接上图（

![](https://oss.443eb9.dev/islandsmedia/7/exposure-before.png)

因此我们需要某种映射。

### 曝光 Exposure

没错，就像在现实生活中拍照一样，虚拟的摄像机也需要设置曝光。它可以由三个参数定义：光圈大小(Aperture, $N$)，快门速度(Shutter Speed, $t$)，和感光度(Sensitivity, ISO, $S$)。曝光值(Exposure Value, EV)可以这么计算：

$$
EV=\log_2(\frac{N^2}{t})
$$

它和ISO无关，如果要将ISO纳入考量：

$$
EV=EV_{100}+\log_2(\frac{S}{100})
$$

其中， $EV_{100}$ 表示在ISO为100时的EV，这是一个直接开放给用户的值：

```rust
pub struct Exposure {
    pub ev100: f32,
}
```

然后是通过物理参数计算EV的函数：

```rust
impl Exposure {
    pub fn from_physical(aperture: f32, shutter_speed: f32, sensitivity: f32) -> Self {
        Self {
            ev100: (aperture * aperture * 100. / shutter_speed / sensitivity).log2(),
        }
    }
}
```

一些常用的EV：

| 场景    | 推荐EV |
| ------- | ------ |
| 晴天    | 15     |
| 阴天    | 12     |
| 室内    | 7      |
| Blender | 9.7    |
> *摘自Bevy Engine*

之后，在输出最终颜色到屏幕前，应用曝光：

```rust
fn apply_exposure(scene: vec3f) -> vec3f {
    return scene / (pow(2., camera.exposure) * 1.2);
}
```

![](https://oss.443eb9.dev/islandsmedia/7/exposure-after.png)

### 色调映射 Tonemapping

除了设置曝光，调整亮度，还需要适当调整颜色。这个部分是可选的。

我们采用与Bevy同样的色调映射方法：[TonyMcMapface](https://github.com/h3r2tic/tony-mc-mapface)

此外还有其他的映射方法，比如Reinhard，Reinhard Extended，AGX等，可以看[这篇文章](https://64.github.io/tonemapping/)。

于是我们再在最后的最后，应用上色调映射：

```rust
@group(2) @binding(4) var tony_mc_mapface_lut: texture_3d<f32>;
@group(2) @binding(5) var tony_mc_mapface_lut_sampler: sampler;

const TONY_MC_MAPFACE_LUT_DIMS: f32 = 48.0;

// Code from Bevy Engine
fn tonemapping_tony_mc_mapface(stimulus: vec3f) -> vec3f {
    var uv = (stimulus / (stimulus + 1.0)) * (f32(TONY_MC_MAPFACE_LUT_DIMS - 1.0) / f32(TONY_MC_MAPFACE_LUT_DIMS)) + 0.5 / f32(TONY_MC_MAPFACE_LUT_DIMS);
    return textureSampleLevel(tony_mc_mapface_lut, tony_mc_mapface_lut_sampler, uv, 0.0).rgb;
}

@fragment
fn fragment(...) -> @location(0) vec4f {
    ...

    color = apply_exposure(color * unlit.base_color);
    return vec4f(tonemapping_tony_mc_mapface(color), 1.);
}
```

![](https://oss.443eb9.dev/islandsmedia/7/lut-after.png)

可以看到颜色变得更为中性，没那么鲜艳了。

最后来个全家福：

![](https://oss.443eb9.dev/islandsmedia/7/final.png)

凹凸映射加上去之后说实话有点丑，但是还是放一下吧：

![](https://oss.443eb9.dev/islandsmedia/7/final-ugly.png)

法线贴图来自：[这里](https://sergun.artstation.com/projects/kbnmy)
