import { Transform } from "@/data/utils"
import { Size } from "@react-three/fiber"
import { Effect } from "postprocessing"
import { forwardRef, useMemo } from "react"
import { Color, DataTexture, Texture, Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three"
import resolvedMainGridFrag from "./resolved-main-grid-frag"

const fragment = `
#include "lygia/generative/fbm.glsl"

struct InfiniteGrid {
    vec2 canvasSize;
    vec2 translation;
    float focusingValue;
    float maxValidNoiseValue;
    sampler2D noise;

    vec3 backgroundColor;
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

float sampleNoise(vec2 coord) {
    vec2 uv = coord / vec2(textureSize(params.noise, 0));
    uv.y = 1.0 - uv.y;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return 1.0;
    }
    return texture2D(params.noise, uv).r;
}

int isIsland(vec2 coord) {
    float noise = sampleNoise(coord);
    
    if (noise < 1.0 && noise < params.maxValidNoiseValue) {
        if (abs(noise - params.focusingValue) < 0.01) {
            return FOCUSED_ISLAND;
        } else {
            return UNFOCUSED_ISLAND;
        }
    } else {
        return NOT_ISLAND;
    }
}

void applyColor(int state, inout vec3 color) {
    if (state == FOCUSED_ISLAND || params.focusingValue == 1.0) {
        color = params.fillColor;
    } else if (state == UNFOCUSED_ISLAND) {
        color = params.unfocusColor * params.fillColor;
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

void wave(vec2 offset, vec2 grid, inout vec3 color) {
    vec3 temporalOffset = params.waveDir * time;
    float noise = fbm(vec3(grid / params.waveScale, 0.0) + temporalOffset);
    float gap = params.cellSize / float(params.waveDensity) * params.scale;
    
    vec2 dotted = mod(offset + gap * 0.5, gap * 2.0);

    if (all(lessThan(dotted, vec2(gap)))) {
        vec3 waveColor = params.waveIntensity * params.waveColor;
        color = mix(waveColor, params.backgroundColor, 1.0 - noise);
    }
}

vec3 getPixelColor(vec2 pixel) {
    vec3 color = params.backgroundColor;

    vec2 offset = mod(pixel + params.thickness * params.scale * 0.5, params.cellSize);
    vec2 grid = floor(pixel / params.cellSize);

    vec2 dash = mod(offset, params.dash * 2.0 * params.scale);
    bool lined = any(lessThan(offset, vec2(params.thickness * params.scale)));
    bool dashed = all(lessThan(dash, vec2(params.dash * params.scale)));

    // Grid borders
    if (lined && dashed) {
        color = params.lineColor;
        return color;
    }
    
#ifdef MODE_ISLANDS
    // Island blocks
    int thisState = isIsland(grid);
    if (thisState == NOT_ISLAND) {
        wave(offset, grid, color);
        if (params.focusingValue < 1.0) {
            color *= params.unfocusColor;
        }
    } else {
        applyColor(thisState, color);
    }
    
    // Outline
    int outlineState = outline(pixel);
    if (outlineState != NOT_ISLAND) {
        color = params.outlineColor;
    }
#elif defined(MODE_NOISE)
    float noise = sampleNoise(grid);
    color = mix(params.backgroundColor, params.fillColor, noise);
#elif defined(MODE_BINARY_NOISE)
    float noise = sampleNoise(grid);
    if (noise > params.maxValidNoiseValue) {
        color = params.fillColor;
    }
#endif

    return color;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixel = (uv * 2.0 - 1.0) * 0.5 * params.canvasSize * params.scale + params.translation;
    outputColor = vec4(getPixelColor(pixel), 1.0);
}
`

export type GridMode = "islands" | "binary-noise" | "noise"

export type MainGridParams = {
    backgroundColor: Color,
    lineColor: Color,
    fillColor: Color;
    unfocusColor: Color,
    outlineColor: Color,
    waveColor: Color,
    thickness: number,
    dash: number,
    transform: Transform,
    focusingValue: { value: number },
    maxValidNoiseValue: number,
    cellSize: number,
    noise: { value: Texture },
    canvasSize: Size,
    focusOutlineThickness: number,
    focusOutlineDist: number,
    waveDir: Vector3,
    waveDensity: number,
    waveIntensity: number,
    waveScale: number,
    mode: GridMode,
}

export type InfiniteGridUniforms = {
    backgroundColor: Color,
    canvasSize: Vector2,
    translation: Vector2,
    focusingValue: number,
    maxValidNoiseValue: number,
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

function paramToUniforms(params: MainGridParams): InfiniteGridUniforms {
    const { transform, focusingValue, noise, canvasSize, mode, ...rest } = params
    return {
        ...rest,
        noise: noise.value,
        focusingValue: focusingValue.value,
        translation: transform.translation,
        scale: transform.scale,
        canvasSize: new Vector2(canvasSize.width, canvasSize.height),
    }
}

function gridModeToDef(mode: GridMode): string[] {
    switch (mode) {
        case "islands": return ["MODE_ISLANDS"]
        case "binary-noise": return ["MODE_BINARY_NOISE"]
        case "noise": return ["MODE_NOISE"]
    }
}

class MainGridImpl extends Effect {
    params: MainGridParams

    constructor(params: MainGridParams) {
        super("MainGridEffect", resolvedMainGridFrag, {
            uniforms: new Map([["params", new Uniform(paramToUniforms(params))]]),
            defines: new Map(gridModeToDef(params.mode).map(def => [def, ""]))
        })

        this.params = params
    }

    update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, _deltaTime?: number): void {
        this.uniforms.get("params")!.value = paramToUniforms(this.params)
    }
}

export const MainGrid = forwardRef(({ params }: { params: MainGridParams }, ref) => {
    const effect = useMemo(() => new MainGridImpl(params), [params])
    return <primitive ref={ref} object={effect} dispose={null} />
})
