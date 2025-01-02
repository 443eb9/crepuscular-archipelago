"use client"

import { IslandMeta } from "@/data/model";
import BgCanvas from "./bg-canvas";
import { createContext, useContext, useEffect, useRef } from "react";
import { Vector2 } from "three";
import { Transform } from "@/data/utils";
import { Size } from "@react-three/fiber";

export type IslandGridContext = {
    cursor: Vector2,
    canvasSize: Size,
}

export const islandGridContext = createContext<IslandGridContext>({
    cursor: new Vector2(),
    canvasSize: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    }
})

type StartDragState = {
    onDrag: boolean,
    cursor: Vector2,
    canvas: Vector2,
}

export default function IslandsGrid({ islands }: { islands: IslandMeta[] }) {
    const dragState = useRef<StartDragState>({
        onDrag: false,
        cursor: new Vector2(),
        canvas: new Vector2(),
    })
    const islandGrid = useContext(islandGridContext)
    const transform = useRef<Transform>({ translation: new Vector2(), scale: 1 })

    function computeCursorPos() {
        const cursorNdc = islandGrid.cursor.clone().multiplyScalar(0.5).addScalar(0.5)
        const canvas = new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height)
        return cursorNdc.multiply(canvas)
    }

    useEffect(() => {
        const dragHandler = () => {
            if (dragState.current.onDrag) {
                const curCursor = computeCursorPos()
                const oldCursor = dragState.current.cursor
                const oldCanvas = dragState.current.canvas
                const curCanvas = curCursor.clone().sub(oldCursor).multiplyScalar(-transform.current.scale).add(oldCanvas)
                transform.current.translation.x = curCanvas.x
                transform.current.translation.y = curCanvas.y
            }
        }

        const endDragHandler = () => dragState.current.onDrag = false

        document.addEventListener("mousemove", dragHandler)
        document.addEventListener("mouseup", endDragHandler)
        return () => {
            document.removeEventListener("mousemove", dragHandler)
            document.removeEventListener("mouseup", endDragHandler)
        }
    }, [dragState])

    return (
        <div>
            <islandGridContext.Provider value={islandGrid}>
                <BgCanvas
                    transform={transform.current}
                    onMouseDown={() => {
                        dragState.current.onDrag = true

                        const initial = computeCursorPos()
                        dragState.current.cursor.x = initial.x
                        dragState.current.cursor.y = initial.y

                        dragState.current.canvas.x = transform.current.translation.x
                        dragState.current.canvas.y = transform.current.translation.y
                    }}
                    onWheel={ev => {
                        const oldScale = transform.current.scale
                        const newScale = Math.max(Math.min(oldScale + ev.deltaY * 0.0004, 2), 1)
                        transform.current.scale = newScale

                        // const factor = newScale / oldScale
                        // const canvas = transform.current.translation.clone()
                        // const cursor = computeCursorPos().multiplyScalar(1 / newScale).add(canvas)
                        // const offset = cursor.sub(canvas).multiplyScalar(1 - factor)
                        // transform.current.translation.x += offset.x
                        // transform.current.translation.y += offset.y
                    }}
                />
            </islandGridContext.Provider>
        </div>
    )
}
