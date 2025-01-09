import { Transform } from "@/data/utils"
import { Size } from "@react-three/fiber"
import { Effect } from "postprocessing"
import { forwardRef } from "react"
import { Color, Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three"

const fragment = `
    struct MouseTrack {
        vec3 color;
        float thickness;
        float blockSize;
        vec2 cursorPos;
        vec2 canvasSize;
    };
    uniform MouseTrack params;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 pixel = params.canvasSize * uv;
        vec2 cursor = params.canvasSize * (params.cursorPos * 0.5 + 0.5);
        vec2 offset = abs(pixel - cursor);

        if (any(lessThan(offset, vec2(params.thickness * 0.5)))) {
            outputColor = vec4(params.color, 1.0);
        } else if (all(lessThan(offset, vec2(params.blockSize * 0.5)))) {
            outputColor = vec4(params.color, 1.0);
        } else {
            outputColor = inputColor;
        }
    }
`

export type MouseTrackerParams = {
    color: Color,
    thickness: number,
    blockSize: number,
    transform: Transform,
    cursorPos: Vector2,
    canvasSize: Size,
}

export type MouseTrackerUniforms = {
    color: Color,
    thickness: number,
    blockSize: number,
    cursorPos: Vector2,
    canvasSize: Vector2,
}

function paramsToUniforms(params: MouseTrackerParams & { cursorPos: Vector2 }): MouseTrackerUniforms {
    const { transform, canvasSize, ...rest } = params
    return {
        ...rest,
        blockSize: params.blockSize / transform.scale,
        canvasSize: new Vector2(canvasSize.width, canvasSize.height),
    }
}

class MouseTrackerImpl extends Effect {
    params: MouseTrackerParams & { cursorPos: Vector2 }

    constructor(params: MouseTrackerParams & { cursorPos: Vector2 }) {
        super("MouseTrackerEffect", fragment, {
            uniforms: new Map([["params", new Uniform(paramsToUniforms(params))]])
        })

        this.params = params
    }

    update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, _deltaTime?: number): void {
        this.uniforms.get("params")!.value = paramsToUniforms(this.params)
    }
}

export const MouseTracker = forwardRef(({ params }: { params: MouseTrackerParams }, ref) => {
    const effect = new MouseTrackerImpl(params)
    return <primitive ref={ref} object={effect} dispose={null} />
})
