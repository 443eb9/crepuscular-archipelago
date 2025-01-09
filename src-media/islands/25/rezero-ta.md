---
title: 从零开始的异世界 TA Chapter 0
subtitle: 大气散射与空气透视 Atmosphere Scattering and Aerial Perspective
desc: 简单的大气散射，与空气透视（废话
ty: article
date: 2024-12-26T01:17:51.000+08:00
banner: true
tags: 图形学,Shader
---
# 从零开始的异世界 TA Chapter 0 - 大气散射与空气透视 Atmosphere Scattering and Aerial Perspective

> 为什么不是从零开始的渲染引擎了？

因为接下来的内容直接在游戏引擎上实现会更方便，直接操纵图形 API 虽然自由度极高，但是步骤异常繁琐。而且之前不选择引擎正是因为我需要这种自由度，阴影映射什么的，用 unity 怎么想都写起来很麻烦吧（（

另外，这段时间通过对于图形 API 的直接使用也更深入地理解了很多东西，比如 View Matrix 实际上是 Transform 的逆矩阵（是的，我以前不知道，一直以为就是 Transform 矩阵），Cube Map 内的坐标系是左手的等等。

综上接下来的内容虽然都是从零开始的一些效果，但是不会在我自己手搓的渲染器内实现。

不过思路是一样的，不影响学习~

好啦，进入正题

参考
- *Real-time Rendering 4th Edition*
- [实时大气散射渲染实战 - 知乎](https://zhuanlan.zhihu.com/p/595576594)
- [体渲染探秘（三）天空大气渲染 - 知乎](https://zhuanlan.zhihu.com/p/419165090)

## 光散射理论 Light Scattering Theory

Participating media 指光在传播时参与的介质，包括散射，和吸收时的。

对于不透明的致密固体，我们已经使用 BRDF 等函数来描述其反射和吸收，然而对于不那么致密的介质，比如雾，会造成散射，有些致密的固体，光还会在其表面产生一定的散射，例如皮肤等。

在接下来的文章中，会使用到一些符号

| 符号       | 含义     | 单位      |
| ---------- | -------- | --------- |
| $\sigma_a$ | 吸收系数 | $m^{-1}$  |
| $\sigma_s$ | 散射系数 | $m^{-1}$  |
| $\sigma_t$ | 湮灭系数 | $m^{-1}$  |
| $\rho$     | 反射率   | /         |
| $p$        | 相位函数 | $sr^{-1}$ |

> From RTR 4

Participating media 主要有以下四种影响光的方式

- 吸收（Absorption）
- Out-scattering 当前粒子散射到其他粒子
- 发光（Emission）
- In-scattering 其他粒子散射到当前粒子

量化成系数

- $\sigma_a$ = Absorption
- $\sigma_s$ = In-scattering
- $\sigma_t$ = Absorption + Out-scattering

## 透射率 Transmittance

$$
T_r(x_a,x_b)=e^{-\tau}
$$

其中

$$
\tau=\int_{x=x_a}^{x_b}\sigma_t(x)||dx||
$$

这个公式也叫 Beer-Lambert Law

翻译成人话就是，从 $x_a$ 到 $x_b$ ，分成若干段，每段为 $dx$ （这里 $x$ 是一个点，也就是向量）计算每个段的 $\sigma_t * ||dx||$ 求和，再取 `exp(-sum)` 。

## 散射 Scattering

$$
L_{scat}=\pi\Sigma_{i=1}^{n}p(\boldsymbol{v},\boldsymbol{l}_{c_i})v(\boldsymbol{x},\boldsymbol{p}_{light})c_{light}(||\boldsymbol{x}-\boldsymbol{p}_{light}||)
$$

其中，$v$ 是可见性函数，$p$ 是相位函数

$$
v=\operatorname{shadowMap}(\boldsymbol{x},\boldsymbol{p}_{light})\cdot\operatorname{volumeShadow}(\boldsymbol{x},\boldsymbol{p}_{light})
$$

在进行大气渲染的时候，我们假设可见性在各个方向都是 1 

### 相位函数 Phase Functions

光的散射在各个方向是不同的，因此需要相位函数来描述这种各向异性。

#### 瑞利散射 Rayleigh Scattering

用于对较大的粒子进行建模

$$
p(\theta)=\frac{3}{16}(1+\cos^2\theta)
$$

对于不同波长的光

$$
\sigma_s\lambda\propto \frac{1}{\lambda^4}
$$

在实际实现中，我们使用一个固定值的颜色来模拟（当然，改变这个颜色值会出现异星球的效果（（

![](https://oss.443eb9.dev/islandsmedia/25/rayleigh-scattering.png)

#### 米氏散射 Mie Scattering

用于对较小，直径接近光波长的粒子建模，有两种近似

**HG 相位函数**

$$
p_{hg}(\theta,g)=\frac{1-g^2}{4\pi(1+g^2-2g\cos\theta)^{1.5}}
$$

**Schlick 相位函数**

$$
p(\theta,k)=\frac{1-k^2}{4\pi(1+k\cos\theta)^2},k\approx1.55g-0.55g^3
$$

![](https://oss.443eb9.dev/islandsmedia/25/mie-scattering.png)
> 红色为 HG 版，蓝色为 Schlick 版

其中，$g$ 的取值决定了这个函数各向异性的程度，表现到画面上，就是太阳周围的泛光强度。

米氏散射与波长无关。

## 大气散射 Atmosphere Scattering

太阳光到达摄像机 $P_c$ 时，首先进入大气层到达 $P_a$ 。假设光线进入大气层时与大气层的交点为 $P_i$ ，那么$P_aP_i$ 为一次吸收，$P_a$ 处发生一次散射，$P_iP_c$ 再发生一次吸收。

首先先搓个米氏散射和瑞利散射

```cpp
float RayleighPhase(float cosTheta)
{
    return 3.0 / 16 * PI * (1.0 + cosTheta * cosTheta);
}

float MiePhaseHG(float g, float cosTheta)
{
    return (1.0 - g * g) / (4.0 * PI * pow(max(0, 1.0 + g * g - 2.0 * g * cosTheta), 1.5));
}

// Not used here, but you can use Schlick approximation, if you want to.
// float SchlickKFromG(float g)
// {
//     return 1.55 * g - 0.55 * g * g * g;
// }

float MiePhaseSchlick(float k, float cosTheta)
{
    float t = 1.0 + k * cosTheta;
    return (1.0 - k * k) / (4.0 * PI * t * t);
}

float Attenuation(float h, float scalarH)
{
    return exp(-h / scalarH);
}

float3 RayleighScattering(float h, AtmoParams params)
{
    float rho = Attenuation(h, params.rayleighScalarHeight);
    return params.rayleighScatter * rho;
}

float3 MieScattering(float h, AtmoParams params)
{
    float rho = Attenuation(h, params.mieScalarHeight);
    return params.mieScatter * rho;
}

float3 Scattering(float3 p, float3 inDir, float3 outDir, in AtmoParams params)
{
    float cosTheta = dot(inDir, outDir);
    float h = length(p) - params.planetRadius;

    float attenRayleigh = Attenuation(h, params.rayleighScalarHeight);
    float attenMie = Attenuation(h, params.mieScalarHeight);
    float3 rayleighColor = attenRayleigh * RayleighPhase(cosTheta) * params.rayleighScatter;
    float3 mieColor = attenMie * MiePhaseHG(params.mieG, cosTheta) * params.mieScatter;

    return rayleighColor + mieColor;
}
```

其中带有 `scalarHeight` 字样的，为标高，是由科学家们测出来的，用于模拟由于海拔升高，大气变稀薄而散射强度的改变。对于瑞利散射为 `8500` ，米氏散射为 `1200` 。

这里因为瑞利散射与波长相关，我们会使用一个特别的颜色 `rayleighScatter` 来代表。`mieScatter` 原则上来讲是 `rgb` 三个通道都相等的，因为他与波长无关。

接下来是透射率

```cpp
float3 MieAbsorption(float h, AtmoParams params)
{
    float rho = Attenuation(h, params.mieScalarHeight);
    return params.mieAbsorption * rho;
}

float3 OzoneAbsorption(float h, AtmoParams params)
{
    float rho = max(0, 1 - abs(h - params.ozoneCenter) / params.ozoneThickness);
    return params.ozoneAbsorption * rho;
}

float3 Transmittance(float3 p1, float3 p2, int samples, in AtmoParams params)
{
    float3 delta = p2 - p1;
    float ds = length(delta) / float(samples);
    float3 acc = 0;

    for (int i = 0; i < samples; i++)
    {
        float3 p = lerp(p1, p2, (float(i) + 0.5) / samples);
        float h = length(p) - params.planetRadius;

        float3 scatter = RayleighScattering(h, params) + MieScattering(h, params);
        float3 absorption = OzoneAbsorption(h, params) + MieAbsorption(h, params);
        float3 extinction = scatter + absorption;

        acc += extinction * ds;
    }

    return exp(-acc);
}
```

这里就是使用 Raymarching 的思想求积分，计算从 $p1$ 到 $p2$ 的透射率。

然后可以看到，多出来的这项 `absorption` ，涵盖了臭氧的吸收和米氏吸收（如果你在模拟一个没有臭氧层的星球，是的可以去掉（废话

在这里，我使用了 `5.68, 13.55, 33.1 * 10^-6` 作为瑞利散射的颜色，`3.996, 3.996, 3.996 * 10^-6` 作为米氏散射的颜色，`4.4, 4.4, 4.4 * 10^-6` 作为米氏吸收的颜色，`0.65, 1.881, 0.085 * 10^-6` 作为臭氧的吸收颜色。

臭氧厚度为 `15000` ，高度为 `25000` 。行星半径 `6360000` 大气厚度 `60000` 。

Ok，剩下来就是 Raymarching ，求在 `viewPos` 处朝 `viewDir` 看，一直延申到大气层的这条路线的透射率。

注意，如果这条视线没法通到大气层，也就是被天体本身固体部分阻挡时，要换成到地面的距离。

```cpp
float3 RayMarchTransmittance(float3 viewPos, float3 viewDir, float3 sunDir, in AtmoParams params)
{
    float viewAtmoDist = RayIntersectSphere(0, params.planetRadius + params.atmoThickness, viewPos, viewDir);
    float viewPlanetDist = RayIntersectSphere(0, params.planetRadius, viewPos, viewDir);
    if (viewPlanetDist > 0) viewAtmoDist = viewPlanetDist;
    float ds = viewAtmoDist / _Samples;

    float3 sum = 0;

    for (int i = 0; i < _Samples; i++)
    {
        float3 p1 = viewPos + (float(i) + 0.5) / _Samples * viewAtmoDist * viewDir;
        float3 sampleAtmoDist = RayIntersectSphere(0, params.planetRadius + params.atmoThickness, p1, sunDir);
        float3 p2 = p1 + sunDir * sampleAtmoDist;

        float3 t1 = Transmittance(p1, p2, _Samples, params);
        float3 s = Scattering(p1, sunDir, viewDir, params);
        float3 t2 = Transmittance(p1, viewPos, _Samples, params);

        float3 in_scattering = t1 * s * t2 * ds;
        sum += in_scattering;
    }

    return sum;
}
```

然后就是一个简单的 Fragment Shader

```cpp
Pass
{
    Name "Ray Marching Atmosphere"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"
    #include "Math.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        AtmoParams params = GetAtmoParams();
        float3 sunDir = _MainLightPosition.xyz;
        float3 sunColor = _MainLightColor.rgb;
        float3 viewDir = ScreenUvToWorldDir(input.uv);
        float3 viewPos = float3(0, _PlanetRadius + _WorldSpaceCameraPos.y, 0);

        float3 atmo = RayMarchTransmittance(viewPos, viewDir, sunDir, params);
        float3 sun = SunDisk(viewDir, sunDir, sunColor);

        return float4(atmo + sun, 1);
    }
    ENDHLSL
}
```

其中用了个转换坐标的函数。

```cpp
float3 ScreenUvToWorldDir(float2 uv)
{
    float2 ndc = (uv * 2 - 1) * float2(1, -1);
    float4 clip = mul(unity_MatrixInvP, float4(ndc, 1, 1));
    float3 world_dir = mul(unity_MatrixInvV, float4(clip.xyz / clip.w, 0)).xyz;
    return normalize(world_dir);
}
```

没啥好说的，图形学基础（

然后 `SunDisk` 函数实现的相对草率，因为没打算好好做太阳（（

不是本篇文章重点啦

```cpp
float3 SunDisk(float3 viewDir, float3 sunDir, float3 sunColor)
{
    if (dot(viewDir, sunDir) > 1 - _SunRadius && viewDir.y > 0)
    {
        return sunColor;
    }
    return 0;
}
```

![](https://oss.443eb9.dev/islandsmedia/25/bruteforce-raymarching.png)

可以看到效果还行，但是这个算法很显然太慢了，计算量是 $n^2$ 的。

### 预计算透射率 Precomputed Transmittance

每次我们都要算一个点到摄像机和这个点到大气层的透射率，那就可以做一些预计算，比如，提前算好每个点到大气层的透射率。

好在大气层可以看作是各向同性的，他影响的因素只有海拔高度。换句话说，可以把大气层像洋葱一样内部切成很多片，每一片的高度是相同的，也就是在这一片上，在大气层以外的参数不变的情况下，透射率是固定的。

对于 $P_cP_a$ 这段路程的散射和透射率，依然可以使用 Raymarching ，一边步进一边求散射，同时一边记录*光学深度*（就是 Beer-Lambert Law 里面的那个 $\tau$）。

假设行星中心位于世界源点。那么对于一个点 $P_a$ ，太阳光的方向为 $\boldsymbol{l}$ ，我们可以用两个参数来量化这个点：$r$ 和 $\cos\theta$ 。

- $r=\operatorname{length}(\boldsymbol{p})-radius$ ，也就是该点的海拔
- $\theta$ 为太阳光的天顶角，即太阳光和向上向量的夹角：$\theta=\boldsymbol{l}\cdot up$ ，$up=\operatorname{normalize}(\boldsymbol{p})$ 以下为了方便起见，令 $\mu=\cos\theta$

直接使用这两个值来量化是不行的，因为精度会很低，所以我们需要进行一些映射。

设：大气层厚度为 $h_{atmo}$ ，地壳半径为 $r_{crust}$

对于 $r$ ，可以转换成经过该点的地壳切线的长度 $\rho$，即视频中绿色线条的长度

当 $\rho=0$ ，该点直接贴在地面上，$r$ 为 $0$ ，当 $\rho$ 到达最大值 $\sqrt{h_{atmo}^2-r_{crust}^2}$ ，$r$ 就变成了大气层的厚度 $h_{atmo}$。

<video controls>
    <source src="https://oss.443eb9.dev/islandsmedia/25/uv-to-param-r.mp4" type="video/mp4">
</video>

对于 $\mu$ ，可以转换为在 $p$ 点时，距离大气层的最远距离 $d_{atmoMax}$。

当 $d_{atmoMax}$ 到达最大值，也就是动画中黄色线条的长度，$\mu=\pi$ ，最小值，也就是绿色线条，$\mu=0$

<video controls>
    <source src="https://oss.443eb9.dev/islandsmedia/25/uv-to-param-mu.mp4" type="video/mp4">
</video>

注意我们这里思考的方式，因为在预计算是，已知的是 uv ，因此需要用 uv 来“预判”未来的结果，未来我们会使用 $\rho$ 和 $d_{atmoMax}$ 查找，用 $r$ 和 $\mu$ 来采样，所以这里需要把 uv 映射到所有可能取到的 $\rho$ 和 $d_{atmoMax}$ 。相当于 $\rho$ 和 $d_{atmoMax}$ 这两个参数是中间货币。

```cpp
/// Returns [
///     distance between sample point and planet center,
///     cosine of angle between light direction and up vector
/// ]
float2 ScreenUvToLutParams(float2 uv, in AtmoParams params)
{
    // Interpolation coefficients
    float dCoeff = uv.x;
    float rCoeff = uv.y;

    float bodyRadius = params.planetRadius + params.atmoThickness;

    float H = SafeSqrt(bodyRadius * bodyRadius - params.planetRadius * params.planetRadius);
    float rho = rCoeff * H;
    float r = SafeSqrt(rho * rho + params.planetRadius * params.planetRadius);

    float dMin = bodyRadius - r;
    float dMax = rho + H;
    float d = lerp(dMin, dMax, dCoeff);
    // Law of cosines.
    float mu = (H * H - rho * rho - d * d) / (2 * r * d);
    mu = clamp(mu, -1, 1);

    return float2(r, mu);
}
```

最后加上 pass

```cpp
Pass
{
    Name "Transmittance Precomputation"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        AtmoParams params = GetAtmoParams();
        float2 lutParams = ScreenUvToLutParams(input.uv, params);
        float3 viewDir = float3(sqrt(1 - lutParams.y * lutParams.y), lutParams.y, 0);
        float3 viewPos = float3(0, lutParams.x, 0);

        float atmoDist = RayIntersectSphere(0, _PlanetRadius + _AtmosphereThickness, viewPos, viewDir);
        float3 intersection = viewPos + atmoDist * viewDir;

        return float4(Transmittance(viewPos, intersection, _Samples, params), 1);
    }
    ENDHLSL
}
```

如果不出以外，渲染结果会是这样的

![](https://oss.443eb9.dev/islandsmedia/25/transmittance-lut.png)

随后就可以使用这张 LUT 来加速了

假设我们现在要采样：

```cpp
float3 LookupTransmittanceToAtmosphere(float3 viewPos, float3 sunDir, in AtmoParams params)
{
    float2 uv = LutParamsToLutUv(float2(length(viewPos), sunDir.y), params);
    return _TransmittanceLut.SampleLevel(sampler_LinearClamp, uv, 0).rgb;
}
```

对于 `LutParamsToLutUv` 函数，我们需要把现在已知的 $\rho$ 和 $d_{atmoMax}$ 转换成 $r$ 和 $\mu$ ，再来采样。

```cpp
/// lutParams = [
///     distance between sample point and planet center,
///     cosine of angle between light direction and up vector
/// ]
float2 LutParamsToLutUv(float2 lutParams, in AtmoParams params)
{
    float r = lutParams.x;
    float mu = lutParams.y;

    float bodyRadius = params.planetRadius + params.atmoThickness;

    float H = SafeSqrt(bodyRadius * bodyRadius - params.planetRadius * params.planetRadius);
    float rho = SafeSqrt(r * r - params.planetRadius * params.planetRadius);

    float dMin = bodyRadius - r;
    float dMax = rho + H;
    // Law of cosines
    float discriminant = r * r * (mu * mu - 1) + bodyRadius * bodyRadius;
    float d = max(0, -r * mu + SafeSqrt(discriminant));

    return float2((d - dMin) / (dMax - dMin), rho / H);
}
```

这边单独抽离一个函数

```cpp
float3 RayMarchSkyView(float3 viewPos, float3 viewDir, float3 sunDir, in AtmoParams params)
{
    float viewAtmoDist = RayIntersectSphere(0, params.planetRadius + params.atmoThickness, viewPos, viewDir);
    float viewPlanetDist = RayIntersectSphere(0, params.planetRadius, viewPos, viewDir);
    if (viewPlanetDist > 0) viewAtmoDist = viewPlanetDist;
    float ds = viewAtmoDist / _Samples;

    float3 sum = 0;
    float3 opticalDepth = 0;

    for (int i = 0; i < _Samples; i++)
    {
        float3 p1 = viewPos + (float(i) + 0.5) / _Samples * viewAtmoDist * viewDir;

        float h = length(p1) - params.planetRadius;
        float3 scatter = RayleighScattering(h, params) + MieScattering(h, params);
        float3 absorption = OzoneAbsorption(h, params) + MieAbsorption(h, params);
        float3 extinction = scatter + absorption;
        opticalDepth += extinction * ds;

        float3 t1 = LookupTransmittanceToAtmosphere(p1, sunDir, params);
        float3 s = Scattering(p1, sunDir, viewDir, params);
        float3 t2 = exp(-opticalDepth);

        float3 in_scattering = t1 * s * t2 * ds;
        sum += in_scattering;
    }

    return sum;
}
```

### 多重散射 Multi-scattering

在现实生活的大气中，散射不可能只有一次，但是在渲染中，又不可能真的去计算这么多次的散射。

真实情况是

$$
L_1(p,\omega)=\int_{p\in ray(p,\omega)}T(P_i,p)\sigma_sdp
$$

$$
G_2(p,v)=\int_\Omega p(P_a,\omega)L_1(p,\omega)d\omega
$$

$$
L_2(p,\omega)=\int_{p\in ray(p,\omega)}G_2(p,-\omega)T(P_i,p)\sigma_sdp
$$

$$
G_3(p,v)=\int_\Omega p(P_a,\omega)L_2(p,\omega)d\omega
$$

$$
L_3(p,\omega)=\int_{p\in ray(p,\omega)}G_3(p,-\omega)T(P_i,p)\sigma_sdp
$$

$$
...
$$

$$
G_n(p,v)=\int_\Omega p(P_a,\omega)L_{n-1}d\omega
$$

$$
L_n(p,\omega)=\int_{p\in ray(p,\omega)}G_n(p,-\omega)T(P_i,p)\sigma_sdp
$$

但是这样的话 LUT 的维数会过高，于是 2020 年 Epic 工程师做出假设

- 多重散射下，相位函数趋于各向同性
- 在采样点 $P_a$ 周围的点，收到 in-scattering 的能量与 $P_a$ 相同。

于是，$p$ 函数消除，$G(p,-\omega)$ 中也不再需要考虑微小的偏移，去除 $-\omega$

$$
G_n(p)=\int_\Omega L_{n-1}(p,\omega)d\omega
$$

$$
L_n(p,\omega)=\int_{p\in ray(p,\omega)}G_n(p)T(P_i,p)\sigma_sdp
$$

$$
G_{n+1}(p)=\int_\Omega L_n(p,\omega)d\omega=\int_\Omega \int_{p\in ray(p,\omega)}G_n(p)T(P_i,p)\sigma_sdp d\omega
$$

太长了换一行（

$$
G_{n+1}=G_n(p)\int_\Omega \int_{p\in ray(p,\omega)}T(P_i,p)\sigma_sdp d\omega
$$

令

$$
f_{ms}=\int_\Omega \int_{p\in ray(p,\omega)}T(P_i,p)\sigma_sdp d\omega
$$

则

$$
G_{n+1}=f_{ms}G_n
$$

于是

$$
\begin{align*}
    \Sigma_{i=2}^nG_i &=G_2(p)+G_3(p)+G_4(p)+... \\
    &=G_2(1+f_{ms}+f_{ms}^2+...) \\
    &=G_2(p)*\frac{1}{1-f_{ms}}
\end{align*}
$$

接下来的任务就是计算

$$
f_{ms}=\int_\Omega \int_{p\in ray(p,\omega)}T(P_i,p)\sigma_sdp d\omega
$$

枚举每一个立体角，搓个 Raymarching 就行

```cpp
float3 RayMarchMultiScattering(float3 viewPos, float3 sunDir, in AtmoParams params)
{
    const float isotropicPhaseFn = 1 / (4 * PI);

    float3 g2 = 0;
    float3 multiScattering = 0;

    for (int phi = 0; phi < _Samples; phi++)
    {
        for (int theta = 0; theta < _Samples; theta++)
        {
            float2 polar = float2((float)phi / _Samples * 2 * PI, ((float)theta + 0.5) / _Samples * PI);
            float3 viewDir = PolarToCartesian(polar);

            float viewAtmoDist = RayIntersectSphere(0, params.planetRadius + params.atmoThickness, viewPos, viewDir);
            float viewPlanetDist = RayIntersectSphere(0, params.planetRadius, viewPos, viewDir);
            if (viewPlanetDist > 0) viewAtmoDist = viewPlanetDist;
            float ds = viewAtmoDist / _Samples;

            float3 opticalDepth = 0;

            for (int i = 0; i < _Samples; i++)
            {
                float3 p = viewPos + (float(i) + 0.5) / _Samples * viewAtmoDist * viewDir;
                float h = length(p) - params.planetRadius;

                float3 scatter = RayleighScattering(h, params) + MieScattering(h, params);
                float3 absorption = OzoneAbsorption(h, params) + MieAbsorption(h, params);
                float3 extinction = scatter + absorption;
                opticalDepth += extinction * ds;

                float3 t1 = LookupTransmittanceToAtmosphere(p, sunDir, params);
                float3 s = Scattering(p, sunDir, viewDir, params);
                float3 t2 = exp(-opticalDepth);

                g2 += t1 * s * t2 * isotropicPhaseFn * ds;
                multiScattering += t2 * scatter * isotropicPhaseFn * ds;
            }
        }
    }

    const float dOmega = 4 * PI / (_Samples * _Samples);
    g2 *= dOmega;
    multiScattering *= dOmega;
    return g2 / (1 - multiScattering);
}
```

如果不出意外，就会得到这样一张 LUT

![](https://oss.443eb9.dev/islandsmedia/25/precomputed-multiscattering.png)

记得更新 `RayMarchSkyView` 函数

```diff
float3 RayMarchSkyView(float3 viewPos, float3 viewDir, float3 sunDir, in AtmoParams params, float maxRayLen = -1)
{
    // ...

    for (int i = 0; i < _Samples; i++)
    {
        // ...

+       float3 multiScattering = LookupMultiScattering(p1, sunDir, params) * t2 * ds;
+       sum += multiScattering;
    }

    return sum;
}
```

### 预计算大气散射 Precomputed Atmosphere Scattering

预计算的目的是下一步进行空气透视计算时更方便，这一步本身没什么难度

```cpp
Pass
{
    Name "Sky View Lookup"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        float3 sunDir = _MainLightPosition.xyz;
        float3 sunColor = _MainLightColor.rgb;
        float3 viewDir = ScreenUvToWorldDir(input.uv);

        float3 atmo = LookupSkyView(viewDir) * sunColor;
        float3 sun = SunDisk(viewDir, sunDir, sunColor);

        return float4(atmo + sun, 1);
    }
    ENDHLSL
}

Pass
{
    Name "Ray Marching Sky View"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"
    #include "Math.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        AtmoParams params = GetAtmoParams();
        float3 sunDir = _MainLightPosition.xyz;
        float3 sunColor = _MainLightColor.rgb;
        float3 viewDir = ScreenUvToWorldDir(input.uv);
        float3 viewPos = float3(0, _PlanetRadius + _WorldSpaceCameraPos.y, 0);

        float3 atmo = RayMarchSkyView(viewPos, viewDir, sunDir, params) * sunColor;
        float3 sun = SunDisk(viewDir, sunDir, sunColor);

        return float4(atmo + sun, 1);
    }
    ENDHLSL
}
```

## 空气透视 Aerial Perspective

空气透视实际上就是雾，但是可以很大程度上提升画面质感。

我们之前做的是计算的大气散射是计算到大气层的透射率，散射等等，如果是到某个物体，那就变成了空气透视。

这玩意也是可以预计算的，就像透射率可以预计算一样。

首先把摄像机的视锥体分成若干块，我们要做的就是计算，从摄像机到这一块中心的透射率。

我们已经有了预计算好的透射率可以使用，但是那是 $P_a$ 到 $P_i$ 的透射率，要想知道 $P_cP_a$ 的透射率，可以使用 $T(P_a,P_i)/T(P_a,P_c)$ ，别忘了，Beer Lambert Law。

为了偷懒，没有用 Compute Shader，这边直接展开 Z 轴到 X 轴上了。

```cpp
Pass
{
    Name "Aerial Perspective Precomputation"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"
    #include "Math.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        const int VOXEL_CNT = 32;

        float texelX = input.uv.x * VOXEL_CNT * VOXEL_CNT;
        float texelY = input.uv.y * VOXEL_CNT;

        float voxelX = fmod(texelX, VOXEL_CNT);
        float voxelY = texelY;
        float voxelZ = texelX / VOXEL_CNT;

        AtmoParams params = GetAtmoParams();
        float3 sunDir = _MainLightPosition.xyz;
        float3 sunColor = _MainLightColor.rgb;
        float3 viewDir = ScreenUvToWorldDir(float2(voxelX, voxelY) / VOXEL_CNT);
        float3 viewPos = float3(0, _PlanetRadius + _WorldSpaceCameraPos.y, 0);

        float voxelDist = _AerialPerspectiveMaxDist * (voxelZ / VOXEL_CNT);
        float3 voxelPos = viewPos + viewDir * voxelDist;

        float3 sky = RayMarchSkyView(viewPos, viewDir, sunDir, params, voxelDist) * sunColor;
        float3 transmittanceEye = LookupTransmittanceToAtmosphere(viewPos, sunDir, params);
        float3 transmittanceVoxel = LookupTransmittanceToAtmosphere(voxelPos, sunDir, params);
        float3 transmittance = transmittanceEye / transmittanceVoxel;

        return float4(sky, dot(transmittance, 1.0 / 3.0));
    }
    ENDHLSL
}
```

会得到这样一张 LUT

![](https://oss.443eb9.dev/islandsmedia/25/precomputed-aerial-perspective.png)

随后的采样，就先计算当前像素的深度，然后采样就完了。

因为我们这里展开成了二维的，就需要手动插值，如果是三维的材质就可以直接采样。

```cpp
Pass
{
    Name "Aerial Perspective Lookup"
    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"
    #include "Packages/com.unity.render-pipelines.core/ShaderLibrary/GlobalSamplers.hlsl"
    #include "FullscreenVertex.hlsl"
    #include "AtmosphereCommon.hlsl"

    float4 frag(VertexOutput input) : SV_Target
    {
        const int VOXEL_CNT = 32;

        float3 sceneColor = SampleSceneColor(input.uv).rgb;
        float depth = SampleSceneDepth(input.uv);
        if (depth == 0.0) return float4(sceneColor, 1);
        float z = Linear01Depth(depth, _ZBufferParams);

        float voxelZFloor = floor(z * VOXEL_CNT);
        float voxelZCeil = ceil(z * VOXEL_CNT);

        float sampleXFloor = input.uv.x / VOXEL_CNT + voxelZFloor / VOXEL_CNT;
        float sampleXCeil = input.uv.x / VOXEL_CNT + voxelZCeil / VOXEL_CNT;
        float sampleY = input.uv.y;

        float4 persp = lerp(
            SAMPLE_TEXTURE2D(_AerialPerspectiveLut, sampler_LinearClamp, float2(sampleXFloor, sampleY)),
            SAMPLE_TEXTURE2D(_AerialPerspectiveLut, sampler_LinearClamp, float2(sampleXCeil, sampleY)),
            frac(z)
        );

        return float4(sceneColor * persp.a + persp.rgb, 1);
    }
    ENDHLSL
}
```

## 结束

这次的实现算是比较简陋的，很想好好研究一下 EA 的[这篇论文](https://github.com/QianMo/Real-Time-Rendering-4th-Bibliography-Collection/blob/main/Chapter%201-24/%5B0203%5D%20%5BComputer%20Graphics%20Forum%202008%5D%20Precomputed%20Atmospheric%20Scattering.pdf) ，下次有空再看看吧（（

最后放几张图

![](https://oss.443eb9.dev/islandsmedia/25/ending-1.png)
![](https://oss.443eb9.dev/islandsmedia/25/ending-2.png)
![](https://oss.443eb9.dev/islandsmedia/25/ending-3.png)

以及我觉得最酷炫的，他甚至可以模拟出接近外太空的质感

![](https://oss.443eb9.dev/islandsmedia/25/ending-space.png)

时间不早了，已经 1:17 了，晚安
