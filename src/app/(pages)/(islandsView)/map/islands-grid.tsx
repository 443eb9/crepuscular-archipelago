"use client"

import { IslandMapMeta, IslandMapRegionCenters, IslandMeta } from "@/data/model";
import BgCanvas from "./bg-canvas";
import { createContext, useContext, useEffect, useState } from "react";
import { Vector2, Vector3 } from "three";
import { Transform } from "@/data/utils";
import { Size } from "@react-three/fiber";
import { fetchIslandAt } from "@/data/api";
import IslandFloatingInfo from "./island-floating-info";

export type IslandGridContext = {
    cursor: Vector2,
    canvasSize: Size,
    drag: {
        onDrag: boolean,
        cursor: Vector2,
        canvas: Vector2,
    },
    canvasTransform: Transform,
    focusingRegionId: {
        value: number | null,
    },
    focusingRegionValue: {
        value: number,
    },
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
    focusingRegionId: {
        value: null,
    },
    focusingRegionValue: {
        value: 1.0,
    },
})

export const GridSettings = {
    cellSize: 40,
    lineThickness: 2,
    dash: 3,
    focusOutlineThickness: 10,
    focusOutlineDist: 5,
    waveDir: new Vector3(0.02, 0.02, 0.1),
    waveDensity: 20,
    waveIntensity: 0.5,
    waveScale: 20,
}

export default function IslandsGrid({
    islands, islandMapMeta, regionCenters, page
}: {
    islands: IslandMeta[], islandMapMeta: IslandMapMeta, regionCenters: IslandMapRegionCenters, page: number
}) {
    const [ready, setReady] = useState(false)
    const islandGrid = useContext(islandGridContext)

    function cursorCanvasPos() {
        const canvas = new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height)
        return islandGrid.cursor.clone().multiply(canvas)
    }

    useEffect(() => {
        islandGrid.canvasTransform.translation.x = islandMapMeta.size * 0.5 * GridSettings.cellSize
        islandGrid.canvasTransform.translation.y = islandMapMeta.size * 0.5 * GridSettings.cellSize
    }, [])

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
    }, [])

    return (
        <div className="overflow-hidden w-[100vw] h-[100vh]">
            <islandGridContext.Provider value={islandGrid}>
                <div className="absolute z-10 w-[100vw] h-[100vh] overflow-hidden pointer-events-none">
                    {
                        ready &&
                        islands.map((island, index) => {
                            const center = regionCenters[index]
                            return (
                                <IslandFloatingInfo
                                    key={index}
                                    regionId={index}
                                    island={island}
                                    center={new Vector2(center[0], center[1])}
                                />
                            )
                        })
                    }
                </div>
                <BgCanvas
                    mapPage={page}
                    onContextMenu={ev => ev.preventDefault()}
                    onMouseDown={ev => {
                        if (ev.button != 2) { return }

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
                        if (ev.button != 0) { return }

                        const cursor = islandGrid.cursor.clone()
                            .multiplyScalar(0.5)
                            .multiply(new Vector2(islandGrid.canvasSize.width, islandGrid.canvasSize.height))
                        const px = cursor
                            .multiplyScalar(islandGrid.canvasTransform.scale)
                            .add(islandGrid.canvasTransform.translation.clone())
                        const grid = px.divideScalar(GridSettings.cellSize).floor()
                        const query = await fetchIslandAt(page, grid.x, grid.y - 1)
                        let result: { regionId: number | null; noiseValue: number; };
                        if (query.ok && query.data.result) {
                            result = { ...query.data.result }
                        } else {
                            result = {
                                regionId: null,
                                noiseValue: 1.0,
                            }
                        }
                        islandGrid.focusingRegionId.value = result.regionId
                        islandGrid.focusingRegionValue.value = result.noiseValue
                    }}
                    onReady={() => setReady(true)}
                />
            </islandGridContext.Provider>
        </div>
    )
}