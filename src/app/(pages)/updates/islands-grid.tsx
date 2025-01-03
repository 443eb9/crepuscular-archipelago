"use client"

import { IslandMeta } from "@/data/model";
import BgCanvas from "./bg-canvas";
import { createContext, useContext, useEffect } from "react";
import { Vector2 } from "three";
import { Transform } from "@/data/utils";
import { Size } from "@react-three/fiber";
import { fetchIslandAt, fetchIslandMapMeta } from "@/data/api";

export type IslandGridContext = {
    cursor: Vector2,
    canvasSize: Size,
    drag: {
        state: "none" | "start" | "ongoing" | "end",
        cursor: Vector2,
        canvas: Vector2,
    },
    canvasTransform: Transform,
    focusingIslandValue: {
        value: number,
    },
    mapSize: number,
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
        state: "none",
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
    mapSize: 0,
})

export const GridSettings = {
    cellSize: 40,
    lineThickness: 2,
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
            if (islandGrid.drag.state == "start" || islandGrid.drag.state == "ongoing") {
                islandGrid.drag.state = "ongoing"

                const curCursor = cursorCanvasPos()
                const oldCursor = islandGrid.drag.cursor
                const oldCanvas = islandGrid.drag.canvas
                const curCanvas = curCursor.clone().sub(oldCursor).multiplyScalar(-islandGrid.canvasTransform.scale / 2).add(oldCanvas)
                islandGrid.canvasTransform.translation.x = curCanvas.x
                islandGrid.canvasTransform.translation.y = curCanvas.y
            }
        }

        const endDragHandler = () => {
            if (islandGrid.drag.state == "ongoing") {
                islandGrid.drag.state = "end"
            }
        }

        document.addEventListener("mousemove", dragHandler)
        document.addEventListener("mouseup", endDragHandler)
        return () => {
            document.removeEventListener("mousemove", dragHandler)
            document.removeEventListener("mouseup", endDragHandler)
        }
    }, [islandGrid.drag.state])

    useEffect(() => {
        async function fetch() {
            const meta = await fetchIslandMapMeta()
            if (meta.ok) {
                islandGrid.mapSize = meta.data.size
            }
        }

        fetch()
    }, [])

    return (
        <div>
            <islandGridContext.Provider value={islandGrid}>
                <BgCanvas
                    onMouseDown={() => {
                        islandGrid.drag.state = "start"

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
                    onClick={async () => {
                        if (islandGrid.drag.state == "end") {
                            islandGrid.drag.state = "none"
                            return
                        }
                        islandGrid.drag.state = "none"

                        const cursor = islandGrid.cursor.clone()
                            .multiplyScalar(0.5)
                            .multiply(new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height))
                        const px = cursor
                            .multiplyScalar(islandGrid.canvasTransform.scale)
                            .add(islandGrid.canvasTransform.translation.clone())
                        const grid = px.divideScalar(GridSettings.cellSize).floor().addScalar(islandGrid.mapSize / 2)
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
