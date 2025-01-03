"use client"

import { IslandMeta } from "@/data/model";
import BgCanvas from "./bg-canvas";
import { createContext, useContext, useEffect, useRef } from "react";
import { Vector2 } from "three";
import { Transform } from "@/data/utils";
import { Size } from "@react-three/fiber";
import { fetchIslandAt } from "@/data/api";

export type IslandGridContext = {
    cursor: Vector2,
    canvasSize: Size,
    drag: DragState,
    canvasTransform: Transform,
    focusingIslandValue: {
        value: number,
    },
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
    },
    focusingIslandValue: {
        value: 1.0,
    },
})

export const GridSettings = {
    cellSize: 40,
    lineThickness: 3,
    dash: 3,
    focusOutlineThickness: 10,
    focusOutlineDist: 5,
}

export default function IslandsGrid({ islands }: { islands: IslandMeta[] }) {
    const islandGrid = useContext(islandGridContext)

    function cursorCanvasPos() {
        const canvas = new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height)
        return islandGrid.cursor.clone().multiply(canvas)
    }

    useEffect(() => {
        const dragHandler = () => {
            if (islandGrid.drag.onDrag) {
                const curCursor = cursorCanvasPos()
                const oldCursor = islandGrid.drag.cursor
                const oldCanvas = islandGrid.drag.canvas
                const curCanvas = curCursor.clone().sub(oldCursor).multiplyScalar(-islandGrid.canvasTransform.scale / 2).add(oldCanvas)
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

                        const initial = cursorCanvasPos()
                        islandGrid.drag.cursor.x = initial.x
                        islandGrid.drag.cursor.y = initial.y

                        islandGrid.drag.canvas.x = islandGrid.canvasTransform.translation.x
                        islandGrid.drag.canvas.y = islandGrid.canvasTransform.translation.y
                    }}
                    onWheel={ev => {
                        const oldScale = islandGrid.canvasTransform.scale
                        const newScale = Math.max(Math.min(oldScale + ev.deltaY * 0.0008, 2), 0.5)
                        islandGrid.canvasTransform.scale = newScale
                    }}
                    onClick={async ev => {
                        // if (ev.detail != 2) { return }
                        if (islandGrid.drag.onDrag) { return }

                        const cursor = islandGrid.cursor.clone()
                            .multiplyScalar(0.5)
                            .multiply(new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height))
                        const px = cursor
                            .multiplyScalar(islandGrid.canvasTransform.scale)
                            .add(islandGrid.canvasTransform.translation.clone())
                        console.log(px.clone().divideScalar(GridSettings.cellSize))
                        const grid = px.divideScalar(GridSettings.cellSize).floor()
                        // Not sure why there's one pixel offset.
                        const query = await fetchIslandAt(grid.x, grid.y - 1)
                        islandGrid.focusingIslandValue.value = query.ok && query.data.result
                            ? query.data.result.texVal
                            : 1
                    }}
                />
            </islandGridContext.Provider>
        </div>
    )
}
