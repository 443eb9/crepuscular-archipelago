export class IslandsPass {
    uniforms: { [name: string]: { value: any } };
    vertexShader: string;
    fragmentShader: string;

    constructor(uniforms: { [name: string]: { value: any } }) {
        this.uniforms = uniforms;
        this.vertexShader = vertexShader();
        this.fragmentShader = fragmentShader();
    }
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
    uniform sampler2D source;

    void main() {
        // gl_FragColor = vec4(vUv, 0, 1);
        gl_FragColor = texture(source, vUv);
    }
    `;
    return frag;
}
