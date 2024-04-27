'use client';

import { useCallback, useState } from "react";
import { EffectComposer, ShaderPass } from "three/examples/jsm/Addons.js";
import { FloatType, LinearFilter, Uniform, Vector2, WebGLRenderTarget, WebGLRenderer } from "three/src/Three.js";
import resolveLygia from "../common/resolve.esm";
import { IslandsNoisePass } from "./passes/islands-noise-pass";
import { JfaPass } from "./passes/jfa-pass";
import { IslandsPass } from "./passes/islands-pass";

export default function IslandsCanvas() {
    const [initialized, setInitialized] = useState(false);

    const canvasRef = useCallback((node: HTMLDivElement | null) => {
        if (node != null && !initialized) {
            initScene(node);
            setInitialized(true);
        }
    }, [initialized]);

    return (
        <div ref={canvasRef}></div>
    );
}

function initScene(node: HTMLDivElement) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    node.appendChild(renderer.domElement);

    const renderTargets = [
        new WebGLRenderTarget(width, height, {
            type: FloatType,
            magFilter: LinearFilter,
            minFilter: LinearFilter,
        }),
        new WebGLRenderTarget(width, height, {
            type: FloatType,
            magFilter: LinearFilter,
            minFilter: LinearFilter,
        }),
    ];

    const numIters = Math.ceil(Math.log2(Math.max(width, height)));

    const noiseComposer = new EffectComposer(renderer, renderTargets[0]);
    noiseComposer.addPass(new ShaderPass(new IslandsNoisePass()));

    const islandsComposer = new EffectComposer(renderer);
    const islandsPass = new IslandsPass({
        source: { value: null },
    });
    islandsComposer.addPass(new ShaderPass(islandsPass));

    const jfaPass = new JfaPass({
        iteration: { value: 0 },
        source: { value: null },
        resolution: new Uniform(new Vector2(width, height)),
    });
    const jfaComposer = new EffectComposer(renderer, renderTargets[1]);
    jfaComposer.addPass(new ShaderPass(jfaPass));

    const update = () => {
        requestAnimationFrame(update);

        // 清除渲染目标
        renderer.setRenderTarget(renderTargets[0]);
        renderer.clear();
        renderer.setRenderTarget(renderTargets[1]);
        renderer.clear();

        noiseComposer.render();

        let curSrc = 0;
        for (let i = 0; i < numIters; i++) {
            jfaPass.uniforms.iteration.value = i;
            jfaPass.uniforms.source.value = renderTargets[curSrc].texture;
            jfaComposer.render();
            curSrc = 1 - curSrc; // 切换渲染目标索引
        }

        islandsPass.uniforms.source.value = renderTargets[numIters % 2].texture;
        islandsComposer.render();
    };

    update();
}

