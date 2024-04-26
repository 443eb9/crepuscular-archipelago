import resolveLygia from "@/components/common/resolve.esm";
import { Uniform, Vector2 } from "three";

export class IslandsNoisePass {
    uniforms: { [name: string]: { value: any } };
    vertexShader: string;
    fragmentShader: string;

    constructor() {
        this.uniforms = uniforms();
        this.vertexShader = vertexShader();
        this.fragmentShader = fragmentShader();
    }
}

function uniforms() {
    return {
        resolution: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
        scale: { value: 200 },
        time: { value: new Date().getSeconds() },
    };
}

function vertexShader() {
    return /* glsl */`
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
}

function fragmentShader() {
    const frag = /* glsl */`
    varying vec2 vUv;
    uniform vec2 resolution;
    uniform float scale;
    uniform float time;

    #include "lygia/generative/fbm.glsl"

    void main() {
        float noise = fbm(vec3((vUv * resolution) / vec2(scale), time)) * 0.5 + 0.5;
        float height = pow(noise, 4.) > 0.2 ? 1. : 0.;

        gl_FragColor = vec4(vec3(height), 1);
    }
    `;
    return resolveLygia(frag);
}
