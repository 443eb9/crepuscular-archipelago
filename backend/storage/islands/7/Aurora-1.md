# 从零开始的渲染引擎-Aurora Chapter 1 使用WGPU的具体实现 Implementation In WGPU

> *You can't do better design with a computer, but you can speed up your work enormously.* --Wim Crouwel

*所以你堆shi山也没关系（逃*

参考：
- *Real-time Rendering 4th Edition*
- Google [*Filament*](https://google.github.io/filament/Filament.html)
- [The view matrix finally explained](https://gamedev.stackexchange.com/questions/178643/the-view-matrix-finally-explained) - Game Development
- [WebGPU Shading Language
W3C Working Draft](https://www.w3.org/TR/WGSL/)
- [Bevy Engine](https://bevyengine.org/)

本文并不会完全将整个Aurora的架构讲解一遍，只会提及其中与图形学关系较大的部分。

## 摄像机 Camera
