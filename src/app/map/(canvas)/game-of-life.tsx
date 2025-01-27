import { Effect } from "postprocessing"
import { forwardRef } from "react"
import { Texture, Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

const fragment = `
struct GameOfLife {
    sampler2D inputState;
    int simulatingFlag;
    vec2 togglePixelAlive;
};
uniform GameOfLife params;

bool isAlive(vec2 coord) {
    vec2 uv = coord / vec2(textureSize(params.inputState, 0));
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
        return false;
    }
    return texture2D(params.inputState, uv).r > 0.5;
}

vec4 stateToColor(bool alive) {
    return vec4(alive ? 1.0 : 0.0);
}

bool gameOfLife(vec2 pixel) {
    int aliveNeighbors = 0;
    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            if (dx != 0 && dy != 0) {
                aliveNeighbors += isAlive(pixel + vec2(dx, dy)) ? 1 : 0;
            }
        }
    }
    bool selfAlive = isAlive(pixel);

    if (selfAlive) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            return false;
        } else {
            // aliveNeighbors == 2 || 3
            return selfAlive;
        }
    } else {
        return aliveNeighbors == 3;
    }
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixel = vec2(textureSize(params.inputState, 0)) * uv;
    if (params.simulatingFlag == 1) {
        outputColor = stateToColor(gameOfLife(pixel));
    } else if (all(greaterThan(params.togglePixelAlive, vec2(-1.0)))) {
        if (all(equal(ivec2(params.togglePixelAlive), ivec2(pixel)))) {
            // Flip state
            outputColor = stateToColor(!isAlive(pixel));
        } else {
            outputColor = stateToColor(isAlive(pixel));
        }
    } else {
        outputColor = stateToColor(isAlive(pixel));
    }
}
`

export type GameOfLifeParams = {
    texA: WebGLRenderTarget,
    texB: WebGLRenderTarget,
    simulating: boolean,
    directionFlagAToB: boolean,
    togglePixelAlive: Vector2,
}

export type GameOfLifeUniforms = {
    inputState: Texture,
    togglePixelAlive: Vector2,
    simulatingFlag: number,
}

function paramsToUniforms(params: GameOfLifeParams): GameOfLifeUniforms {
    return {
        ...params,
        inputState: params.directionFlagAToB ? params.texA.texture : params.texB.texture,
        simulatingFlag: params.simulating ? 1 : 0,
    }
}

class GameOfLifeImpl extends Effect {
    params: GameOfLifeParams

    constructor(params: GameOfLifeParams) {
        super("GameOfLifeEffect", fragment, {
            uniforms: new Map([["params", new Uniform(paramsToUniforms(params))]])
        })

        this.params = params
    }

    update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, _deltaTime?: number): void {
        this.uniforms.get("params")!.value = paramsToUniforms(this.params)
    }
}

export const GameOfLife = forwardRef(({ params }: { params: GameOfLifeParams }, ref) => {
    const effect = new GameOfLifeImpl(params)
    return <primitive ref={ref} object={effect} dispose={null} />
})
