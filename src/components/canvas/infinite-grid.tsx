import { Transform } from "@/data/utils"
import { Effect } from "postprocessing"
import { forwardRef, useMemo } from "react"
import { Color, Texture, Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

const fragment = `
    struct InfiniteGrid {
        vec3 color;
        vec3 fillColor;
        float thickness;
        float scale;
        float cellSize;
        float dash;
        vec2 translation;
        sampler2D noise;
    };
    uniform InfiniteGrid params;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 pixel = (uv * 2.0 - 1.0) * 0.5 * resolution * params.scale + params.translation;
        vec2 offset = mod(pixel, params.cellSize);
        vec2 grid = floor(pixel / params.cellSize);

        vec2 dash = mod(offset, params.dash * 2.0 * params.scale);
        bool lined = any(lessThan(offset, vec2(params.thickness * params.scale)));
        bool dashed = all(lessThan(dash, vec2(params.dash * params.scale)));

        if (lined) {
            if (dashed) {
                outputColor = vec4(params.color, 1.0);
            }
            return;
        }
        
        vec2 islandUv = grid / vec2(textureSize(params.noise, 0)) + 0.5;
        if (islandUv.x < 0.0 || islandUv.x > 1.0 || islandUv.y < 0.0 || islandUv.y > 1.0) {
            return;
        }
        float noise = texture2D(params.noise, islandUv).r;
        if (noise > 0.1) {
            outputColor = vec4(params.fillColor, 1.0);
        }
    }
`

export type InfiniteGridParams = {
    color: Color,
    fillColor: Color;
    thickness: number,
    dash: number,
    transform: Transform,
    cellSize: number,
    noise: Texture,
}

export type InfiniteGridUniforms = {
    color: Color,
    fillColor: Color;
    thickness: number,
    scale: number,
    cellSize: number,
    dash: number,
    translation: Vector2,
    noise: Texture,
}

function paramToUniforms(params: InfiniteGridParams): InfiniteGridUniforms {
    const { transform, ...rest } = params

    return {
        ...rest,
        translation: transform.translation,
        scale: transform.scale,
    }
}

class InfiniteGridImpl extends Effect {
    params: InfiniteGridParams

    constructor(params: InfiniteGridParams) {
        super("InfiniteGridEffect", fragment, {
            uniforms: new Map([["params", new Uniform(paramToUniforms(params))]])
        })

        this.params = params
    }

    update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, _deltaTime?: number): void {
        this.uniforms.get("params")!.value = paramToUniforms(this.params)
    }
}

export const InfiniteGrid = forwardRef(({ params }: { params: InfiniteGridParams }, ref) => {
    const effect = useMemo(() => new InfiniteGridImpl(params), [params])
    return <primitive ref={ref} object={effect} dispose={null} />
})
