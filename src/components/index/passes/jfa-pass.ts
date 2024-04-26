import { Uniform, Vector2 } from "three";

export class JfaPass {
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
        iteration: { value: null },
        source: { value: null },
        resolution: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
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
    uniform int iteration;
    uniform sampler2D source;
    uniform vec2 resolution;

    void main() {

    }
    `;
    return frag;
}
