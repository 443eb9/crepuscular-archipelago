export class JfaPass {
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
    uniform int iteration;
    uniform sampler2D source;
    uniform ivec2 resolution;

    void main() {
        float best_dist = 9999999.;
        vec2 best_px = vec2(0.);
        ivec2 px = ivec2(vUv * vec2(resolution));
    
        int step = int(max(max(resolution.x, resolution.y) >> (iteration + 1), 1));
    
        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                ivec2 neighbor_px = ivec2(px) + ivec2(dx, dy) * step;
                vec4 neighbor_data = texture(source, vec2(neighbor_px) / vec2(resolution));
                
                if (neighbor_data.x > 0. && neighbor_data.y > 0.) {
                    float d = distance(vec2(px), neighbor_data.xy);
                    if (d < best_dist) {
                        best_dist = d;
                        best_px = neighbor_data.xy;
                    }
                }
            }
        }
        
        gl_FragColor = vec4(best_px, 0, 0);
    }
    `;
    return frag;
}
