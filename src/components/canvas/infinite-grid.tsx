import { Transform } from "@/data/utils"
import { Size } from "@react-three/fiber"
import { Effect } from "postprocessing"
import { forwardRef, useMemo } from "react"
import { Color, Texture, Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

const fragment = `
    struct InfiniteGrid {
        vec3 color;
        vec3 fillColor;
        vec3 focusColor;
        float thickness;
        float scale;
        float cellSize;
        float dash;
        float focusingValue;
        vec2 translation;
        sampler2D noise;
        vec2 canvasSize;
        float focusOutline;
    };
    uniform InfiniteGrid params;

    // Returns 0 for not island, 1 for island not focusing, 2 for island focusing.
    int isIsland(vec2 coord) {
        vec2 uv = coord / vec2(textureSize(params.noise, 0));;
        uv.y = 1.0 - uv.y;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            return 0;
        }
        float noise = texture2D(params.noise, uv).r;
        
        if (noise < 1.0) {
            if (abs(noise - params.focusingValue) < 0.02) {
                return 2;
            } else {
                return 1;
            }
        } else {
            return 0;
        }
    }

    // State 0 for not island, 1 for island not focusing, 2 for island focusing.
    void applyColor(int state, out vec4 color) {
        if (state == 0) {
            // Skip
        } else if (state == 1) {
            color = vec4(params.fillColor, 1.0);
        } else if (state == 2) {
            color = vec4(params.focusColor, 1.0);
        }
    }

    void applyOutlineColor(int state, out vec4 color) {
        if (state == 2) {
            color = vec4(params.focusColor, 1.0);
        }
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 pixel = (uv * 2.0 - 1.0) * 0.5 * params.canvasSize * params.scale + params.translation;
        vec2 offset = mod(pixel, params.cellSize);
        vec2 grid = floor(pixel / params.cellSize);

        vec2 dash = mod(offset, params.dash * 2.0 * params.scale);
        bool lined = any(lessThan(offset, vec2(params.thickness * params.scale)));
        bool dashed = all(lessThan(dash, vec2(params.dash * params.scale)));

        // Grid borders
        if (lined) {
            if (dashed) {
                outputColor = vec4(params.color, 1.0);
            }
            return;
        }
        
        // Island blocks
        int thisState = isIsland(grid);
        applyColor(thisState, outputColor);

        if (thisState != 0) {
            return;
        }
        
        // Outline
        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) { continue; }

                vec2 sampleCoord = pixel + vec2(dx, dy) * params.focusOutline;
                int state = isIsland(floor(sampleCoord / params.cellSize));
                if (state == 2) {
                    applyColor(state, outputColor);
                    return;
                }
            }
        }
    }
`

export type InfiniteGridParams = {
    color: Color,
    fillColor: Color;
    focusColor: Color,
    thickness: number,
    dash: number,
    transform: Transform,
    focusingValue: { value: number },
    cellSize: number,
    noise: Texture,
    canvasSize: Size,
    focusOutline: number,
}

export type InfiniteGridUniforms = {
    color: Color,
    fillColor: Color;
    thickness: number,
    scale: number,
    cellSize: number,
    dash: number,
    focusingValue: number,
    translation: Vector2,
    noise: Texture,
    canvasSize: Vector2,
    focusOutline: number,
}

function paramToUniforms(params: InfiniteGridParams): InfiniteGridUniforms {
    const { transform, focusingValue, canvasSize, ...rest } = params

    return {
        ...rest,
        focusingValue: focusingValue.value,
        translation: transform.translation,
        scale: transform.scale,
        canvasSize: new Vector2(canvasSize.width, canvasSize.height),
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
