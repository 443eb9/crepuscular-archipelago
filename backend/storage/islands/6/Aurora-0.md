---
title: 从零开始的渲染引擎-Aurora Chapter 0
subtitle: 基于物理的着色 Physically Based Shading
desc: 第零章，介绍PBR实现的理论模型。着重介绍BRDF与微表面学说，本文注重理论而非实现，实现以及其他细节在第一章。
ty: Article
date: 2024-06-07T20:49:10.000+08:00
banner: true
tags: 图形学,数学
---

# 从零开始的渲染引擎-Aurora Chapter 0 基于物理的着色 Physically Based Shading

> Let the form of an object be what it may, --light, shade and perspective will always make it beautiful. *--John Constable*

<img src="https://oss.443eb9.dev/islandsmedia/6/PhysicsBasedShading-Dark.svg" style="background-color: #191919">

本文中未经考证的翻译将会用<u>下划线</u>标识，标出英文原文，并且在之后使用英文原文。

参考：
- *Real-time Rendering 4th Edition*
- Google [*Filament*](https://google.github.io/filament/Filament.html)

## <u>反射方程</u> Reflectance Equation

![](https://oss.443eb9.dev/islandsmedia/6/refl_eq_brdf.png)

$$
L_o = \int_{\boldsymbol{l}\in\Omega} f(\boldsymbol{l}, \boldsymbol{v})L_i(\boldsymbol{p}, \boldsymbol{l})(\boldsymbol{n} \cdot \boldsymbol{l}) dl
$$

其中
- $L_o$ 表示在一个点上的辐射率，也就是不同波长的光的亮度。在实际渲染中，因为我们使用RGB颜色来模拟光波长的分布，因此这个值也可以当成是这个点的颜色。
- $f$ 即为双向反射分布函数(BRDF)，它描述了对于不同波长的光，这个点可以反射多少，当然实际渲染也是取颜色。
- $L_i$ 表示输入光

当入射光向量 $\boldsymbol{l}$ 在这个半球上面扫一遍，积出来的值，就是最终结果。

为了求解，这个方程需要被转化成用 $\phi$ 和 $\theta$ 的形式，也就是使用立体角的微分的形式替代向量的微分。

$$
L_o(\theta_o, \phi_o) = \int_{\phi_i=0}^{2\pi} \int_{\theta_i=0}^{\frac{\pi}{2}} f(\phi_i, \theta_i, \phi_o, \theta_o)L(\phi_i, \theta_i)\cos \theta_i \sin \theta_i d\theta_i d\phi_i
$$

使用 $\mu_i$ 代替 $\cos \theta_i$ ，$\mu_o$ 代替 $\cos \theta_o$，还可以进一步简化

$$
L_o(\theta_o, \phi_o) = \int_{\phi_i=0}^{2\pi} \int_{\mu_i=0}^1 f(\phi_i, \mu_i, \phi_o, \mu_o)L(\phi_i, \mu_i)\mu_i d\mu_i d\phi_i
$$

在实际应用中，我们取它的近似

$$
L_{o} \approx \pi f(\boldsymbol{l},\boldsymbol{v})c_{light}(\boldsymbol{n}\cdot\boldsymbol{l})^+
$$

### 立体角

![](https://oss.443eb9.dev/islandsmedia/6/refl_eq_sol_ang.png)

图中蓝色区域即为立体角，可以用这块区域的面积除以半径的平方得到。

$$
d\Omega = \frac{dA}{r^2}
$$

同样的，我们还可以用 $\theta$ 表示仰角 $\phi$ 表示方位角。也就是用蓝色区域的"宽"乘以"高"。

宽，$BC$ 弧，长度为 $d\phi * BF$ ，因为$BF = r\sin\theta$，所以 $BC = rd\phi\sin\theta$ （别忘了 $\theta$ 是法线到 $OB$ 的夹角！不是 $OB$ 和 $xy$ 平面的夹角！）

高，$AB$ 弧，长度为 $rd\theta$

因此立体角可以表示为

$$
d\Omega = \frac{r\sin \theta d\phi * rd\theta}{r^2} = \sin \theta d\phi d\theta
$$

所以上面Reflectance Equation里面，$dl$ 就被这一坨（懒得打）代替了，然后又因为这里都是单位向量和单位球，因此 $\boldsymbol{n}\cdot\boldsymbol{l}$ 就被 $\cos\theta_i$ 代替了。

## 双向反射分布函数 Bidirectional Reflectance Distribution Function (BRDF)

先随便举个BRDF吧

$$
f(\boldsymbol{l},\boldsymbol{v})_{Lambertian} = \frac{\rho_{ss}}{\pi}
$$

其中
- $\rho_{ss}$ 表示漫反射的颜色

如果你有实现过Lambert光照模型（总该实现过吧，要不然直接看PBR有点猛的），那么你应该知道，在这个模型下，$L_o = \rho_{ss}L_i\boldsymbol{n}\cdot\boldsymbol{l}$ ，但它还可以表示为

$$
L_o = \pi * \frac{\rho_ss}{\pi} L_i (\boldsymbol{n}\cdot\boldsymbol{l}) = \rho_{ss}L_i\boldsymbol{n}\cdot\boldsymbol{l}
$$

哎！是不是这个陌生的方程突然就有点眼熟了！

> 至于这个 $\pi$ 是哪里来的，分是怎么积的，就留给未来学了微积分的我吧~

那你应该还知道，有Blinn-Phong模型提供高光反射的计算，这里不展开了。所以你应该猜到了，BRDF其实是一个由多个函数，比如漫反射函数，高光反射等，定义的函数，它可以决定反射出来的光的颜色（实际上是光在每段波长上面的亮度）。

为了衡量一个BRDF在计算时的能量损耗，可以使用Directional-hemispherical Reflectance $R(\boldsymbol{l})$

$$
R(\boldsymbol{l})=\int_{\boldsymbol{v}\in\Omega}f(\boldsymbol{l},\boldsymbol{v})(\boldsymbol{n}\cdot\boldsymbol{v})d\boldsymbol{v}
$$

和Hemispherical-directional Reflectance $R(\boldsymbol{v})$

$$
R(\boldsymbol{v})=\int_{\boldsymbol{l}\in\Omega}f(\boldsymbol{l},\boldsymbol{v})(\boldsymbol{n}\cdot\boldsymbol{l})d\boldsymbol{l}
$$

当它们可以被互换使用时，可以用Directional albedo来作为总称。

## 微表面理论 Microfacet Theory

目前，大部分的BRDF模型都基于这个理论。

正如它的名字，微表面理论就是认为，一个宏观的平面实际上是由很多小的平面组成的。它们有各种各样的*法线*，对入射光进行*反射*和*遮挡*为了描述这个表面，让我们再引入几个函数：

- 法线分布函数(NDF) $D(\boldsymbol{m})$ 它可以表示在这个平面上的法线方向的分布
- 遮挡函数 $G(\boldsymbol{m}, \boldsymbol{v})$ 它表示从 $\boldsymbol{v}$ 方向看下去，法线会被怎么遮挡

这里都是统计学上的，并不是真的每根法线怎么怎么朝向。

还有一些为了计算方便的定义，都比较符合直觉：

对于每一根法线在单位平面上的积，应当是一整个单位平面：

$$
f_{m\in\Theta}D(\boldsymbol{m})(\boldsymbol{n}\cdot\boldsymbol{m})d\boldsymbol{m} = 1
$$

另外，视线在每个法线上的投影，应当等于视线在宏观平面上的投影

$$
f_{m\in\Theta}D(\boldsymbol{m})(\boldsymbol{v}\cdot\boldsymbol{m})d\boldsymbol{m} = \boldsymbol{v}\cdot\boldsymbol{n}
$$

这里都是一整个球的积分，因为微表面上的法线是可以和视线相反的。

接下来我们再引入遮挡函数，就可以得到我们可以看到的全部微表面。

$$
f_{\in\Theta}G_1(\boldsymbol{m},\boldsymbol{v})D(\boldsymbol{m})(\boldsymbol{v}\cdot\boldsymbol{m})^+d\boldsymbol{m} = \boldsymbol{v}\cdot\boldsymbol{m}
$$

加号角标同 `max(x, 0)` ，也就是保证这玩意是正的，或者说过滤掉负的，也就是看不见的。

这里面的 $G_1(\boldsymbol{m},\boldsymbol{v})$ 表示遮挡， 那么一整个 $G_1(\boldsymbol{m},\boldsymbol{v})D(\boldsymbol{m})$ 就叫 <u>可见法线的分布</u>(Distribution of Visible Normals)

遮挡函数可以是任意取的，在2014年Heitz的论文中，他提出了 Smith Masking Function

$$
G_1(\boldsymbol{m},\boldsymbol{v}) = \frac{\chi^+(\boldsymbol{m},\boldsymbol{v})}{1+\Lambda(\boldsymbol{v})}
$$

$$
\chi^+(\boldsymbol{x}) =
\left\{
    \begin{aligned}
        1, \mathrm{where} \ x > 0, \\
        0, \mathrm{where} \ x \le 0,
    \end{aligned}
\right.
$$

其中 $\Lambda$ 函数是一个和NDF配套的函数。

然而遮挡造成的影响既可以是对于视线向量来说的，也可以是光照方向来说的，也就是既可以表示我们看不见的，也可以表示光找不到的，因此我们将这二者都考虑进去，得到一个更完善的遮挡函数。也就是 <u>联合遮挡函数</u>(Joint Masking Function)

$$
G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m}) = G_1(\boldsymbol{v},\boldsymbol{m})G_1(\boldsymbol{l},\boldsymbol{m})
$$

显然，微表面的高度也会影响它被遮挡的概率，如果我们只考虑微表面有不同高度，就得到了这个遮挡函数

$$
G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m}) = \lambda(\phi)G_1(\boldsymbol{v},\boldsymbol{m})G_1(\boldsymbol{l},\boldsymbol{m})+(1-\lambda(\phi))\min(G_1(\boldsymbol{v},\boldsymbol{m})G_1(\boldsymbol{l},\boldsymbol{m}))
$$

其中的 $\lambda(\phi)$ 是一个随着方位角 $\phi$ 增加而在 $[0,1]$ 范围内增加的函数
。比如可以是Ashikhmin等人提出的 $\lambda(\phi)=1-e^{-7.3\phi^2}$ ，或者是van Ginneken等人提出的 $\lambda(\phi)=\frac{4.41\phi}{4.41\phi+1}$

当我们同时考虑高度和法线，就可以得到最终的遮挡函数

$$
G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m}) = \frac{\chi^+(\boldsymbol{m}\cdot\boldsymbol{v})\chi^+(\boldsymbol{m}\cdot\boldsymbol{l})}{1+\Lambda(\boldsymbol{v})+\Lambda(\boldsymbol{l})}
$$

Heitz也提出了高度相关的遮挡函数

$$
G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m}) = \frac{\chi^+(\boldsymbol{m}\cdot\boldsymbol{v})\chi^+(\boldsymbol{m}\cdot\boldsymbol{l})}{1+\max(\Lambda(\boldsymbol{v}),\Lambda(\boldsymbol{l}))+\lambda(\boldsymbol{v},\boldsymbol{l})\min(\Lambda(\boldsymbol{v}),\Lambda(\boldsymbol{v}))}
$$

其中的 $\lambda$ 函数是个经验函数，比如上面的那两个，或者是特定NDF推导出的函数。

是时候来完善一下我们的微表面BRDF $f_\mu$ 了，它这时应当兼顾视线，光线的遮挡。

$$
f(\boldsymbol{l},\boldsymbol{v})=\int_{\boldsymbol{m}\in\Theta}f_\mu(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m})G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{m})D(\boldsymbol{m})\frac{(\boldsymbol{m}\cdot\boldsymbol{l})^+}{|\boldsymbol{n}\cdot\boldsymbol{l}|}\frac{(\boldsymbol{m}\cdot\boldsymbol{v})^+}{|\boldsymbol{n}\cdot\boldsymbol{v}|}d\boldsymbol{m}
$$

## 菲涅尔反射 Fresnel Reflectance

菲涅尔反射的一个特点就是在平行与表面法线观察时，物体会呈现它本来的颜色，当视线越来越接近于垂直与法线时，物体会出现接近白色的高光。

为了模拟这个效果，Schlick给出了一个菲涅尔反射的近似方程，它本质上就是根据 $\boldsymbol{n}$ 和 $\boldsymbol{l}$ 之间的夹角的正弦值来将物体本来的固有色和白色插值。

$$
F(\boldsymbol{n},\boldsymbol{l}) \approx F_0 + (1 - F_0)(1 - (\boldsymbol{n}\cdot\boldsymbol{l})^+)^5
$$

$$
F_0 = (\frac{n-1}{n+1})^2
$$

其中
- $n$ 为这个材料的折射率(Index of Refraction, IOR)
- $F_0$ 为这种材料的颜色。对于水，$F_0 = (\frac{n_1-n_2}{n_1+n_2})^2$

再后来的一些应用中，Schlick的近似方程出现了更通用的形式

$$
F(\boldsymbol{n},\boldsymbol{l}) \approx F_0 + (F_{90} - F_0)(1 - (\boldsymbol{n}\cdot\boldsymbol{l})^+)^{\frac{1}{p}}
$$

其中
- $F_{90}$ 为另一个颜色，可以更好地显示材料的特征

不同材料之间——金属，非金属，半导体——的菲涅尔反射的表现不尽相同，那么为了量化这一点，引入 $metallic$ 属性，也就是这个表面有多"金属"。

当 $metallic=1$ 时，菲涅尔反射，或者说，使用了菲涅尔反射的高光反射，它的反射颜色 $F_0$ 就是表面的颜色 ，且漫反射颜色 $\rho_{ss}$ 为黑色，当 $metallic=0$ 时，$\rho_{ss}$ 为表面的颜色，而 $F_0$ 变成一个比较灰的颜色。

至于为什么金属表面的漫反射是黑色，是因为金属不存在漫反射。当入射光进入金属，金属内的自由电子会吸收光的能量并再直接反射出来，而没有在次表面发生散射。

有一点比较有意思的，虽然和本文话题没关系，就是书中提到金的 $F_0$ 的红色分量是略高于1的，也许金独特的颜色就是它在整个人类文明中的意义非凡的原因吧。

> Gold's bright and strongly colored reflectance probably contributes to its unique cultural and economic significance throughout the history. --*Real-time Rendering*

## 高光反射BRDF

首先，当发生高光反射的时候，也就意味着光线经过反射之后可以直接进入摄像机，此时，表面法线可以被认为是一个半角向量(Half Vector)

$$
h = \frac{\boldsymbol{l}+\boldsymbol{v}}{|\boldsymbol{l}+\boldsymbol{v}|}
$$

进而可以认为，整个由微表面构成的宏观表面，它的法线就是 $h$ ，或者说每一个微表面的法线都是 $h$ ，因为我们在折腾高光反射，如果某个微表面的法线不是 $h$ 的话，那么它就不会产生高光反射。

于是就推导出高光反射BRDF $f_{spec}$

$$
f_{spec}(\boldsymbol{l},\boldsymbol{v})=\frac{\boldsymbol{F(\boldsymbol{h},\boldsymbol{l})G_2(\boldsymbol{l},\boldsymbol{v},\boldsymbol{h}),D(\boldsymbol{h})}}{4|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|}
$$

### 各向同性NDF Isotropic NDFs

各向同性，表示这个材质看上去的样子和我看它的角度没有关系。

它们可以用一个比较通用的方式表示

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})}{\alpha^2(\boldsymbol{n}\cdot\boldsymbol{m})^4}g\left(\frac{\sqrt{1-(\boldsymbol{n}\cdot\boldsymbol{m})^2}}{\alpha(\boldsymbol{n}\cdot\boldsymbol{m})}\right)
$$

其中
- $g$ 代表一个单变量函数。

$$
a=\frac{\boldsymbol{n}\cdot\boldsymbol{s}}{a\sqrt{1-(\boldsymbol{n}\cdot\boldsymbol{s})^2}}
$$

$$
\boldsymbol{s}=\boldsymbol{v} \ or \ \boldsymbol{l}
$$

#### Beckmann NDF

$$
D(\boldsymbol{m})=\frac{\chi+(\boldsymbol{n}\cdot\boldsymbol{m})}{\pi\alpha_b^2(\boldsymbol{n}\cdot\boldsymbol{m})^4} e^{\frac{(\boldsymbol{n}\cdot\boldsymbol{m})^2-1}{\alpha_b^2(\boldsymbol{n}\cdot\boldsymbol{m})^2}}
$$

其中
- $\alpha_b$ 是这个表面的粗糙程度 $roughness$ ，它和微表面法线的均方根($\sqrt{\frac{1}{n}\sum_i x_i^2}$)相关。

其配套的 $\Lambda$ 函数为

$$
\Lambda(a)=\frac{\mathrm{erf}(a)-1}{2}+\frac{1}{2a\sqrt{\pi}}e^{-a^2}
$$

$\mathrm{erf}$ 是一个错误函数，由于其很难求解，因此Beckmann NDF可以用一个近似函数代替

$$
\Lambda(a) \approx
\left\{
    \begin{aligned}
        &\frac{1-1.259a+0.396a^2}{3.535a+2.181a^2}, where \ a<1.6, \\
        &0, where \ a \lt 1.6
    \end{aligned}
\right.
$$

#### Blinn-Phong NDF

这个多半是大多数人学渲染第一个碰到的高光模型了吧hhhhhhh

$$
D(\boldsymbol{m})=\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})\frac{\alpha_p+2}{2\pi}(\boldsymbol{n}\cdot\boldsymbol{m})^{\alpha_p}
$$

$\alpha_p$ 和表面光滑程度不是成线性关系的，因此在实际应用中，可以用类似于 $m^s$ 的形式将输入值映射成非线性变化的值。

比较神奇的一点是（至少我觉得很神奇）：这里的 $\alpha_p$ 和 Beckmann NDF 的 $\alpha_b$ 可以互相转换

$$
\alpha_p = 2\alpha_b^{-2}-2
$$

Blinn-Phong NDF 没有其对应的 $\Lambda$ 函数，不过由于它的 $\alpha_p$ 可以转换成 $\alpha_b$ ，可以使用Beckmann NDF的 $\Lambda$ 函数。

#### GGX Distribution

一个应该是最(?)流行的NDF...吧？就算不是"最"，那也是"很"。

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})\alpha_g^2}{\pi(1+(\boldsymbol{n}\cdot\boldsymbol{m})^2(\alpha_g^2-1))^2}
$$

其中的 $\alpha_g$ 有多个来源，比如可以直接使用Beckmann NDF的。在<u>迪士尼原则</u>(Disney Principle)的模型中也可以使用由Burley提出的 $\alpha_g=r^2$ ，其中 $r$ 是你可以控制的 $roughness$。

GGX的配套 $\Lambda$ 函数是

$$
\Lambda=\frac{-1+\sqrt{1+\frac{1}{a^2}}}{2}
$$

Lagarde将GGX对应的 $G_2$ 高度相关的遮挡函数简化

$$
\frac{G_2(\boldsymbol{l},\boldsymbol{v})}{4|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|} \approx \frac{0.5}{\mu_o\sqrt{\alpha^2+\mu_i(\mu_i-\alpha^2\mu_i)}+\mu_i\sqrt{{\alpha^2+
\mu_o(\mu_o-\alpha^2\mu_o)}}}
$$

$$
\mu_i=(\boldsymbol{n}\cdot\boldsymbol{l})^+
$$

$$
\mu_o=(\boldsymbol{n}\cdot\boldsymbol{v})^+
$$

$\mu_i$ 和 $\mu_o$ 是被简化过的。

Karis提出了特别于GGX的近似版 $G_1$

$$
G_1(\boldsymbol{s})=\frac{2(\boldsymbol{n}\cdot\boldsymbol{s})}{(\boldsymbol{n}\cdot\boldsymbol{s})(2-\alpha)+\alpha}
$$

再次提醒，$\boldsymbol{s}$ 表示 $\boldsymbol{v}$ 或 $\boldsymbol{l}$

针对这个 $G_1$ ，Hammon又提出了一个更高效的高度相关的遮挡函数 $G_2$ ，它和BRDF的一部分结合之后，同样可以得到简化

$$
\frac{G_2(\boldsymbol{l},\boldsymbol{v})}{4|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|} \approx \frac{0.5}{\mathrm{lerp}(2|\boldsymbol{n}\cdot\boldsymbol{l}||\boldsymbol{n}\cdot\boldsymbol{v}|,|\boldsymbol{n}\cdot\boldsymbol{l}|+|\boldsymbol{n}\cdot\boldsymbol{v}|,\alpha)}
$$

其中
- $\mathrm{lerp}$ 表示线性插值，$\mathrm{lerp}(a,b,t)=a(1-t)+bt$

#### Generalized Trowbridge-Reitz (GTR) NDF

为了可以控制高光亮斑的形状，Burley提出了

$$
D(\boldsymbol{m})=\frac{k(\alpha,\gamma)}{\pi(1+(\boldsymbol{n}\cdot\boldsymbol{m})^2(\alpha_g^2-1))^\gamma}
$$

$$
k(\alpha,\gamma)=
\left\{
    \begin{aligned}
        &\frac{(\gamma-1)(\alpha^2-1)}{(1-(\alpha^2)^{1-\gamma})}, where \ \gamma \ne 1 \ and \ \alpha \ne 1, \\
        &\frac{\alpha^2-1}{\ln{\alpha^2}}, where \ \gamma = 1 \ and \ \alpha \ne 1, \\
        &1, where \ \alpha = 1
    \end{aligned}
\right.
$$

随着 $\gamma$ 下降，亮斑的拖尾变长，反之变短。

不过同时正因为这个NDF形成的亮斑形状不是均匀的，$G_2$ 的寻找变得极为困难，在GTR提出三年后，一张根据 $\gamma$ 值的对应 $G_2$ 值的表格被提出，实际运用中可以采用插值。

#### 其他NDF和方法

书中还提到了Student's-distribution(STD) NDF和Exponential Power Distribution(EPD) NDF，不过这两者都很新，书中并没有提到具体应用。

此外，为了改变高光反射的亮斑形状，还可以使用多个NDF。

### 各向异性NDF Anisotropic NDFs

各向异性就说明这个材料我从不同角度看，得到的结果可以是不一样的。随便抓个不锈钢盆就能明白了。

不同与各向同性的NDF，各向异性的需要除了 $\theta_m$ 之外，一般还需要 $\boldsymbol{m}\cdot\boldsymbol{n},\boldsymbol{m}\cdot\boldsymbol{t},\boldsymbol{m}\cdot\boldsymbol{b}$ 来求解。

$\boldsymbol{n}$ 为法线，$\boldsymbol{t}$ 为切线 $\boldsymbol{b}$ 为副切线，如果你不知道什么是副切线的话，$\boldsymbol{b}=\boldsymbol{n}\times\boldsymbol{t}$ 。

一般创造各向异性NDF的方法是用各向同性的推导

它们也有比较通用的形式

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})}{\alpha_x\alpha_y(\boldsymbol{n}\cdot\boldsymbol{m})^4}g\left(\frac{\sqrt{\frac{(\boldsymbol{t}\cdot\boldsymbol{m})^2}{\alpha_x^2}+\frac{(\boldsymbol{b}\cdot\boldsymbol{m})^2}{\alpha_y^2}}}{(\boldsymbol{n}\cdot\boldsymbol{m})}\right)
$$

其中
- $\alpha_x$ $\alpha_y$ 表示沿 $x$ 或 $y$ 轴的 $roughness$ 。

$$
a=\frac{\boldsymbol{n}\cdot\boldsymbol{s}}{\sqrt{\alpha_x^2(\boldsymbol{t}\cdot\boldsymbol{s})^2+\alpha_y^2(\boldsymbol{b}\cdot\boldsymbol{s})^2}}
$$

那么Beckmann NDF的各向异性版本就可以变成

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})}{\pi\alpha_x\alpha_y(\boldsymbol{n}\cdot\boldsymbol{m})^4}e^{\frac{\frac{(\boldsymbol{t}\cdot\boldsymbol{m})^2}{\alpha_x^2}+\frac{(\boldsymbol{b}\cdot\boldsymbol{m})^2}{\alpha_y^2}}{(\boldsymbol{n}\cdot\boldsymbol{m})^2}}
$$

以及GGX的

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})}{\pi\alpha_x\alpha_y(\frac{(\boldsymbol{t}\cdot\boldsymbol{m})^2}{\alpha_x^2}+\frac{(\boldsymbol{b}\cdot\boldsymbol{m})^2}{\alpha_y^2}+(\boldsymbol{n}\cdot\boldsymbol{m})^2)^2}
$$

还有更通用的方式，就是对 $roughness$ Burley提出的 $\alpha_g=r^2$ 的基础上，加一个 $k_{aspect}$

$$
k_{aspect}=\sqrt{1-0.9k_{aniso}}
$$

$$
\alpha_x=\frac{r^2}{k_{aspect}}
$$

$$
\alpha_y=r^2k_{aspect}
$$

Imageworks还使用了其他的参数化方式

$$
\alpha_x=r^2(1+k_{aniso})
$$

$$
\alpha_y=r^2(1-k_{aniso})
$$

### <u>多重表面反射</u> Multiple-Bounce Surface Reflection

由于上述BRDF都没有考虑到光线可以在微表面之间反射，因此会出现比较明显的能量不守恒的现象，也就是表面会随着表面变粗糙而变暗。

于是Imagework提出了一个BRDF的小分量，加上去用于计算微表面间的反射

$$
f_{ms}(\boldsymbol{l},\boldsymbol{v})=\frac{\overline{F} \ \overline{R_{sF1}}}{\pi(1-\overline{R_{sF1}})(1-\overline{F}(1-\overline{R_{sF1}}))}(1-\overline{R_{sF1}}(\boldsymbol{l})(1-\overline{R_{sF1}}(\boldsymbol{v})))
$$

$R_{sF1}$ 表示 $f_{sF1}$ ，也就是 $F_0=1$ 的 $f_{spec}$ ，的Directional albedo。因此它只由 $roughness$ 和 $\theta_i$ 绝对，也就可以保存在一张二维贴图内。

而 $\overline{R_{sF1}}$ 表示 $R_{sF1}$ 在半球上的<u>余弦加权平均</u>(Cosin-weighted Average)，它只由 $roughness$ 一个变量决定，因此可以保存在一张一维贴图内。

$$
\overline{R_{sF1}}=\frac{\int_{\boldsymbol{s}\in\Omega}R_{sF1}(\boldsymbol{s})(\boldsymbol{n}\cdot\boldsymbol{s})d\boldsymbol{s}}{\int_{\boldsymbol{s}\in\Omega}(\boldsymbol{n}\cdot\boldsymbol{s})d\boldsymbol{s}}=\frac{1}{\pi}\int_{\phi=0}^{2\pi}\int_{\mu=0}^1R_{sF1}(\mu)\mu d\mu d\phi=2\int_{\mu=0}^1R_{sF1}(\mu)\mu d\mu
$$

$\overline{F}$ 是菲涅尔反射项，同理可得 $\overline{F}=2\int_{\mu=0}^1F(\mu)\mu d\mu$ 。

Imagework也提供了一个通用的近似解

$$
\overline{F}=\frac{2p^2F_{90}+(3p+1)F_0}{2p^2+3p+1}
$$

如果使用了Schlick的菲涅尔近似，那么还可以进一步简化为

$$
\overline{F}=\frac{20}{21}F_0+\frac{1}{21}
$$

对于各向异性的材料的 $roughness$，Imagework使用了一个在 $\alpha_x$ 和 $\alpha_y$ 间的中间值。

### 漫反射BRDF

实际上这章叫BRDF Models for Subsurface Scattering，不过在不透明的绝缘体(更准确的说，介电质(Dielectric))上，次表面散射就表现为漫反射。

#### <u>光滑次表面模型</u> Smooth-Surface Subsurface Models

对于一个"光滑"的平面，散射光的范围大于微表面的坑洼的程度。

最简单的漫反射BRDF就是

$$
f_{diff}=\frac{\rho_{ss}}{\pi}
$$

但是它没有考虑到在视角变化时，因为存在菲涅尔反射，高光反射的强度会产生变化。这就导致反射的光强度和入射光的差别较大，因此可以引入菲涅尔反射来"抵消"一部分漫反射。

如果假设表面光滑到变成一面镜子，那么它的法线就是宏观表面的法线

$$
f_{diff}(\boldsymbol{l},\boldsymbol{v})=(1-F(\boldsymbol{n},\boldsymbol{l}))\frac{\rho_{ss}}{\pi}
$$

如果假设表面是由很多微表面组成的，那么就可以使用 $\boldsymbol{h}$ ，也就是刚好发生高光反射时的微表面法线，来代替。

Shirley之后提出了另一个BRDF，它强调了菲涅尔反射造成的能量的转移，可以做到能量守恒

$$
f_{diff}(\boldsymbol{l},\boldsymbol{v})=\frac{21}{20\pi}\rho_{ss}(1-(1-(\boldsymbol{n}\cdot\boldsymbol{l})^+)^5)(1-(1-(\boldsymbol{n}\cdot\boldsymbol{v})^+)^5)
$$

其中的菲涅尔反射项用的是Schlick近似式

再之后，Ashikhmin和Shirley又提出了它的通用版本

$$
f_{diff}(\boldsymbol{l},\boldsymbol{v})=\rho_{ss}\frac{(1-R_{spec}(\boldsymbol{l}))(1-R_{spec}(\boldsymbol{v}))}{\pi(1-\overline{R_{spec}})}
$$

$R_{spec}$ 为这个整个高光反射BRDF的Directional Albedo，也就是它考虑了菲涅尔反射。

#### <u>粗糙表面次表面模型</u> Rough-Surface Subsurface Models

Burley提出了一个漫反射BRDF，作为Disney Principle BRDF的一部分。

$$
f_{diff}=\chi^+(\boldsymbol{n}\cdot\boldsymbol{l})\chi^+(\boldsymbol{n}\cdot\boldsymbol{v})\frac{\rho_{ss}}{\pi}((1-k_{ss})f_d+1.25k_{ss}f_{ss})
$$

其中

$$
\begin{aligned}
    &f_d=(1+(F_{D90}-1)(1-\boldsymbol{n}\cdot\boldsymbol{l})^5)(1+(F_{D90}-1)(1-\boldsymbol{n}\cdot\boldsymbol{v})^5) \\

    &F_D{90}=0.5+2\sqrt{\alpha}(\boldsymbol{h}\cdot\boldsymbol{l})^2 \\

    &f_{ss}=\left(\frac{1}{(\boldsymbol{n}\cdot\boldsymbol{l})(\boldsymbol{n}\cdot\boldsymbol{v})}-0.5\right)F_{SS}+0.5 \\

    &F_{SS}=(1+(F_{SS90}-1)(1-\boldsymbol{n}\cdot\boldsymbol{l})^5)(1+(F_{SS90}-1)(1-\boldsymbol{n}\cdot\boldsymbol{v})^5) \\

    &F_{SS90}=\sqrt{\alpha}(\boldsymbol{h}\cdot\boldsymbol{l})^2
\end{aligned}
$$

*这tm真的是碳基生物能想出来的公式吗？？？*

其中
- $\alpha$ 是表面粗糙度 $roughness$
- $k_{ss}$ 是一个由用户控制的变量，它对 $f_d$ 粗糙漫反射项和 $f_{ss}$ 次表面项进行插值。

那么还有一些基于微表面理论的BRDF，比如Hammon提出的

$$
f_{diff}(\boldsymbol{l}\cdot\boldsymbol{v})=\chi^+(\boldsymbol{n}\cdot\boldsymbol{l})\chi^+(\boldsymbol{n}\cdot\boldsymbol{v})\frac{\rho_{ss}}{\pi}((1-\alpha_g)f_{smooth}+\alpha f_{rough}+\rho_{ss}f_{multi})
$$

其中

$$
\begin{aligned}
    &f_{smooth}=\frac{21}{20}(1-F_0)(1-(1-\boldsymbol{n}\cdot\boldsymbol{l})^5)(1-(1-\boldsymbol{n}\cdot\boldsymbol{v})^5) \\

    &f_{rough}=k_{facing}(0.9-0.4k_{facing})\left(\frac{0.5+\boldsymbol{n}\cdot\boldsymbol{h}}{\boldsymbol{n}\cdot\boldsymbol{h}}\right) \\

    &k_{facing}=0.5+0.5(\boldsymbol{l}\cdot\boldsymbol{v}) \\

    &f_{multi}=0.3641\alpha_g
\end{aligned}
$$

*又是一个碳基生物想不出来的方程 :(*

其中
- $\alpha_g$ 是GGX模型的 $roughness$

## 布料BRDF BRDF Models for Cloth

### 经验模型 Empirical Cloth Models

在游戏*Uncharted 2*中，布料的漫反射模型是

$$
f_{diff}(\boldsymbol{l},\boldsymbol{v})=\frac{\rho_{ss}}{\pi}\left(k_{rim}((\boldsymbol{v}\cdot\boldsymbol{n}^+)^{\alpha_{rim}}+k_{inner}(1-(\boldsymbol{v}\cdot\boldsymbol{n})^+)^{\alpha_{inner}})+k_{diff}\right)
$$

在*Uncharted 4*中

$$
f_{diff}(\boldsymbol{l},\boldsymbol{v})(\boldsymbol{n}\cdot\boldsymbol{l})^+\rArr(c_{scatter}+(\boldsymbol{n}\cdot\boldsymbol{l})^+)^\mp\frac{(\boldsymbol{n}\cdot\boldsymbol{l}+\omega)^\mp}{1+\omega}
$$

$x^\mp$ 就是 `saturate(x)` ，或者说

$$
x^\mp=
\left\{
    \begin{aligned}
        &1,where \ x > 1, \\
        &x,where \ 0 \le x \le 1, \\
        &0,where \ x < 0,
    \end{aligned}
\right.
$$

### 微表面布料模型 Microfacet Cloth Models

Ashikhmin等人使用了逆高斯分布(Inverse Gaussian Distribution)提出了一个布料NDF，之后的*The Order: 1866*中，使用了一个结合了微表面BRDF和通用化的上述BRDF。它使用了上面这个了来自*Uncharted 4*的方程作为漫反射项。

它的NDF是

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})}{\pi(1+k_{amp}\alpha^2)}\left(1+\frac{k_{amp}e^{\frac{(\boldsymbol{n}\cdot\boldsymbol{m})^2}{\alpha^2((\boldsymbol{n}\cdot\boldsymbol{m})^2-1)}}}{(1-(\boldsymbol{n}\cdot\boldsymbol{m})^2)^2}\right)
$$

其中
- $\alpha$ 控制了逆高斯分布的宽度
- $k_{amp}$ 控制逆高斯分布的高度

完整的BRDF是

$$
f(\boldsymbol{l},\boldsymbol{v})=(1-F(\boldsymbol{h},\boldsymbol{l}))\frac{\rho_{ss}}{\pi}+\frac{F(\boldsymbol{h},\boldsymbol{l})D(\boldsymbol{h})}{4(\boldsymbol{n}\cdot\boldsymbol{l}+\boldsymbol{n}\cdot\boldsymbol{v}-(\boldsymbol{n}\cdot\boldsymbol{l})(\boldsymbol{n}\cdot\boldsymbol{v}))}
$$

Imagework又提出了一个NDF可用于全部 $f_{sheen}$

> sheen n.光彩;光泽<br>
> The conditioner gives hair a beautiful soft sheen.
这种护发素能使头发美丽、柔顺，富有光泽。
>
> --*Cambridge Dictionary*

$$
D(\boldsymbol{m})=\frac{\chi^+(\boldsymbol{n}\cdot\boldsymbol{m})(2+\frac{1}{\alpha})(1-(\boldsymbol{n}\cdot\boldsymbol{m})^2)^{\frac{1}{2\alpha}}}{2\pi}
$$

这个NDF没有准确的Smith遮挡函数可以配套，因此Imagework采用了一个解析函数来近似。

### <u>微柱体布料模型</u> Micro-Cylinder Cloth Models

该模型认为布料表面上存在无数个线段，所以这个和渲染头发的思路相似。

书中提到了Kajiya-Kay BRDF和Banks BRDF之后在学习毛发渲染的时候再具体说吧。（躺

## <u>波光学BRDF</u> Wave Optics BRDF Models

超越几何！波光学的BRDF试图模拟光的衍射，干涉等更为复杂的物理现象。

嘛...不过书里几乎没有给出详细的模型。好（逃

## 混合与过滤 Blendering and Filtering

在实际应用中，一个物体可能是由多个材质混合而成的。这个时候就需要材质混合。但是我觉得这玩意应该放到贴花(Decal)一章将。嗯，就是这样。（逃 again
