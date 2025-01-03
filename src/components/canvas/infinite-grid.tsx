import { Transform } from "@/data/utils"
import { Size } from "@react-three/fiber"
import { Effect } from "postprocessing"
import { forwardRef, useMemo } from "react"
import { Color, Texture, Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three"
import resolveLygia from "../../data/lygia"

const fragment = `
    #include "lygia/generative/fbm.glsl"

    struct InfiniteGrid {
        vec2 canvasSize;
        vec2 translation;
        float focusingValue;
        sampler2D noise;

        vec3 lineColor;
        vec3 fillColor;
        vec3 unfocusColor;
        vec3 outlineColor;
        vec3 waveColor;

        float thickness;
        float scale;
        float cellSize;
        float dash;

        float focusOutlineThickness;
        float focusOutlineDist;

        vec3 waveDir;
        int waveDensity;
        float waveIntensity;
        float waveScale;
    };
    uniform InfiniteGrid params;

    const int NOT_ISLAND = 0;
    const int UNFOCUSED_ISLAND = 1;
    const int FOCUSED_ISLAND = 2;

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
            return params.unfocusColor * params.fillColor;
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

    vec3 wave(vec2 offset, vec2 grid) {
        vec3 temporalOffset = params.waveDir * time;
        float noise = fbm(vec3(grid / params.waveScale, 0.0) + temporalOffset);
        float gap = params.cellSize / float(params.waveDensity) * params.scale;
        
        vec2 dotted = mod(offset + gap * 0.5, gap * 2.0);

        if (all(lessThan(dotted, vec2(gap)))) {
            return noise * params.waveIntensity * params.waveColor;
        }
        return vec3(0.0);
    }

    vec3 getPixelColor(vec2 pixel) {
        vec3 color;

        vec2 offset = mod(pixel + params.thickness * params.scale * 0.5, params.cellSize);
        vec2 grid = floor(pixel / params.cellSize);

        vec2 dash = mod(offset, params.dash * 2.0 * params.scale);
        bool lined = any(lessThan(offset, vec2(params.thickness * params.scale)));
        bool dashed = all(lessThan(dash, vec2(params.dash * params.scale)));
        
        // Island blocks
        int thisState = isIsland(grid);
        if (thisState == NOT_ISLAND) {
            color = wave(offset, grid);
            if (params.focusingValue != 1.0) {
                color *= params.unfocusColor;
            }
        } else {
            color = applyColor(thisState);
        }

        // Grid borders
        if (lined && dashed) {
            color = params.lineColor;
        }
        
        // Outline
        int outlineState = outline(pixel);
        if (outlineState != NOT_ISLAND) {
            color = params.outlineColor;
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
    outlineColor: Color,
    waveColor: Color,
    thickness: number,
    dash: number,
    transform: Transform,
    focusingValue: { value: number },
    cellSize: number,
    noise: Texture,
    canvasSize: Size,
    focusOutlineThickness: number,
    focusOutlineDist: number,
    waveDir: Vector3,
    waveDensity: number,
    waveIntensity: number,
    waveScale: number,
}

export type InfiniteGridUniforms = {
    canvasSize: Vector2,
    translation: Vector2,
    focusingValue: number,
    noise: Texture,

    lineColor: Color,
    fillColor: Color,
    unfocusColor: Color,
    outlineColor: Color,
    waveColor: Color,

    thickness: number,
    scale: number,
    cellSize: number,
    dash: number,
    focusOutlineThickness: number,
    focusOutlineDist: number,

    waveDir: Vector3,
    waveDensity: number,
    waveIntensity: number,
    waveScale: number,
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
        super("InfiniteGridEffect", resolveLygia(fragment), {
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
