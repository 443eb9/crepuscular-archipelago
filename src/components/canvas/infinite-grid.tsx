import { Transform } from "@/data/utils"
import { Size } from "@react-three/fiber"
import { Effect } from "postprocessing"
import { forwardRef, useMemo } from "react"
import { Color, Texture, Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

const fragment = `
    struct InfiniteGrid {
        vec3 lineColor;
        vec3 fillColor;
        vec3 unfocusColor;
        float thickness;
        float scale;
        float cellSize;
        float dash;
        float focusingValue;
        vec2 translation;
        sampler2D noise;
        vec2 canvasSize;
        float focusOutlineThickness;
        float focusOutlineDist;
    };
    uniform InfiniteGrid params;

    const int NOT_ISLAND = 0;
    const int UNFOCUSED_ISLAND = 1;
    const int FOCUSED_ISLAND = 2;

    // Returns 0 for not island, 1 for island not focusing, 2 for island focusing.
    int isIsland(vec2 coord) {
        vec2 uv = coord / vec2(textureSize(params.noise, 0)) + 0.5;
        uv.y = 1.0 - uv.y;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            return NOT_ISLAND;
        }
        float noise = texture2D(params.noise, uv).r;
        
        if (noise < 1.0) {
            if (abs(noise - params.focusingValue) < 0.02) {
                return FOCUSED_ISLAND;
            } else {
                return UNFOCUSED_ISLAND;
            }
        } else {
            return NOT_ISLAND;
        }
    }

    vec3 applyColor(int state) {
        if (state == FOCUSED_ISLAND || params.focusingValue == 1.0) {
            return params.fillColor;
        } else if (state == UNFOCUSED_ISLAND) {
            return params.unfocusColor;
        } else {
            return vec3(0.0);
        }
    }

    int outline(vec2 pixel) {
        int result = NOT_ISLAND;

        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) { continue; }

                vec2 sampleCoord = pixel + vec2(dx, dy) * params.focusOutlineThickness;
                vec2 gapCoord = pixel + vec2(dx, dy) * params.focusOutlineDist;
                int sampleState = isIsland(floor(sampleCoord / params.cellSize));
                int gapState = isIsland(floor(gapCoord / params.cellSize));

                if (gapState == FOCUSED_ISLAND) {
                    return NOT_ISLAND;
                }
                
                if (sampleState == FOCUSED_ISLAND && gapState != FOCUSED_ISLAND) {
                    result = sampleState;
                }
            }
        }
        
        return result;
    }

    vec3 getPixelColor(vec2 pixel) {
        vec3 color;

        vec2 offset = mod(pixel + params.thickness * params.scale * 0.5, params.cellSize);
        vec2 grid = floor(pixel / params.cellSize);

        vec2 dash = mod(offset, params.dash * 2.0 * params.scale);
        bool lined = any(lessThan(offset, vec2(params.thickness * params.scale)));
        bool dashed = all(lessThan(dash, vec2(params.dash * params.scale)));

        // Grid borders
        if (lined) {
            if (dashed) {
                color = params.lineColor;
            }
        }
        
        // Island blocks
        int thisState = isIsland(grid);
        
        // Outline
        int outlineState = outline(pixel);

        if (outlineState != NOT_ISLAND) {
            color = applyColor(outlineState);
        }
        if (thisState != NOT_ISLAND && !(lined && dashed)) {
            color = applyColor(thisState);
        }

        return color;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 pixel = (uv * 2.0 - 1.0) * 0.5 * params.canvasSize * params.scale + params.translation;
        outputColor = vec4(getPixelColor(pixel), 1.0);
    }
`

export type InfiniteGridParams = {
    lineColor: Color,
    fillColor: Color;
    unfocusColor: Color,
    thickness: number,
    dash: number,
    transform: Transform,
    focusingValue: { value: number },
    cellSize: number,
    noise: Texture,
    canvasSize: Size,
    focusOutlineThickness: number,
    focusOutlineDist: number,
}

export type InfiniteGridUniforms = {
    lineColor: Color,
    fillColor: Color;
    unfocusColor: Color;
    thickness: number,
    scale: number,
    cellSize: number,
    dash: number,
    focusingValue: number,
    translation: Vector2,
    noise: Texture,
    canvasSize: Vector2,
    focusOutlineThickness: number,
    focusOutlineDist: number,
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
