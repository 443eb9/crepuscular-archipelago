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
    drag: DragState,
    canvasTransform: Transform,
}

type DragState = {
    onDrag: boolean,
    cursor: Vector2,
    canvas: Vector2,
}

export const islandGridContext = createContext<IslandGridContext>({
    cursor: new Vector2(),
    canvasSize: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    },
    drag: {
        onDrag: false,
        cursor: new Vector2(),
        canvas: new Vector2(),
    },
    canvasTransform: {
        translation: new Vector2(),
        scale: 1,
    }
})

export default function IslandsGrid({ islands }: { islands: IslandMeta[] }) {
    const islandGrid = useContext(islandGridContext)

    function computeCursorPos() {
        const cursorNdc = islandGrid.cursor.clone().multiplyScalar(0.5).addScalar(0.5)
        const canvas = new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height)
        return cursorNdc.multiply(canvas)
    }

    useEffect(() => {
        const dragHandler = () => {
            if (islandGrid.drag.onDrag) {
                const curCursor = computeCursorPos()
                const oldCursor = islandGrid.drag.cursor
                const oldCanvas = islandGrid.drag.canvas
                const curCanvas = curCursor.clone().sub(oldCursor).multiplyScalar(-islandGrid.canvasTransform.scale).add(oldCanvas)
                islandGrid.canvasTransform.translation.x = curCanvas.x
                islandGrid.canvasTransform.translation.y = curCanvas.y
            }
        }

        const endDragHandler = () => islandGrid.drag.onDrag = false

        document.addEventListener("mousemove", dragHandler)
        document.addEventListener("mouseup", endDragHandler)
        return () => {
            document.removeEventListener("mousemove", dragHandler)
            document.removeEventListener("mouseup", endDragHandler)
        }
    }, [islandGrid.drag.onDrag])

    return (
        <div>
            <islandGridContext.Provider value={islandGrid}>
                <BgCanvas
                    onMouseDown={() => {
                        islandGrid.drag.onDrag = true

                        const initial = computeCursorPos()
                        islandGrid.drag.cursor.x = initial.x
                        islandGrid.drag.cursor.y = initial.y

                        islandGrid.drag.canvas.x = islandGrid.canvasTransform.translation.x
                        islandGrid.drag.canvas.y = islandGrid.canvasTransform.translation.y
                    }}
                    onWheel={ev => {
                        const oldScale = islandGrid.canvasTransform.scale
                        const newScale = Math.max(Math.min(oldScale + ev.deltaY * 0.0004, 2), 1)
                        islandGrid.canvasTransform.scale = newScale

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
