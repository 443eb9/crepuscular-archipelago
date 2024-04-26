'use client';

import { useCallback, useState } from "react";
import { EffectComposer, ShaderPass } from "three/examples/jsm/Addons.js";
import { Uniform, Vector2, WebGLRenderTarget, WebGLRenderer } from "three/src/Three.js";
import resolveLygia from "../common/resolve.esm";
import { IslandsNoisePass } from "./passes/islands-noise-pass";

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

    const composer = new EffectComposer(renderer);
    // composer.renderToScreen = false;
    let islandsNoise = new ShaderPass(new IslandsNoisePass());
    composer.addPass(islandsNoise);

    const update = () => {
        requestAnimationFrame(update);
        composer.render();
    };
    update();
}
