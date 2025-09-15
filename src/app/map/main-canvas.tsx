"use client"

import { IslandMapMeta, IslandMeta } from "@/data/model"
import { RefObject, useContext, useEffect, useRef, useState } from "react"
import { Color, NearestFilter, Texture, TextureLoader, Vector2, Vector3, VideoTexture } from "three"
import { fetchIslandAt, islandMapUrl } from "@/data/api"
import { canvasStateContext, islandGridContext } from "./islands-map"
import { Canvas, useThree } from "@react-three/fiber"
import { GridMode, MainGrid } from "./(canvas)/main-grid"
import { useTheme } from "next-themes"
import { MouseTracker } from "./(canvas)/mouse-tracker"
import { EffectComposer } from "@react-three/postprocessing"
import { processUrlSearchParams } from "@/data/search-param-util"
import { useSearchParams } from "next/navigation"

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

export type CanvasMode = { mode: "islands" } | { mode: "bad-apple", video: RefObject<HTMLVideoElement | null> }

export default function MainCanvas({
    islands, islandMapMeta, canvasMode, maxValidNoiseValueOverride
}: {
    islands: IslandMeta[], islandMapMeta: IslandMapMeta, canvasMode: CanvasMode, maxValidNoiseValueOverride?: number
}) {
    const islandGrid = useContext(islandGridContext)
    const resolverRef = useRef<HTMLDivElement>(null)
    const searchParams = processUrlSearchParams(useSearchParams())

    const [colors, setColors] = useState<{
        foreground: Color,
        neutral: Color,
        background: Color,
    } | undefined>()
    const [noise, setNoise] = useState<Texture | VideoTexture | undefined>()
    const [updateFlag, setUpdateFlag] = useState(false)
    const canvasState = useContext(canvasStateContext)
    const { resolvedTheme } = useTheme()

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

    useEffect(() => {
        // TODO not elegant, although works
        setTimeout(() => {
            if (resolverRef.current) {
                const style = window.getComputedStyle(resolverRef.current)
                setColors({
                    foreground: new Color(style.borderLeftColor),
                    neutral: new Color(style.backgroundColor),
                    background: new Color(style.borderRightColor),
                })
            }
        }, 100)
    }, [resolvedTheme])

    useEffect(() => {
        const resizeHandler = () => {
            setUpdateFlag(!updateFlag)
        }

        window.addEventListener("resize", resizeHandler)
        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [updateFlag])

    useEffect(() => {
        switch (canvasMode.mode) {
            case "islands":
                const islandsNoise = new TextureLoader().load(islandMapUrl(searchParams.page))
                islandsNoise.magFilter = NearestFilter
                islandsNoise.minFilter = NearestFilter
                setNoise(islandsNoise)
                break
            case "bad-apple":
                if (!canvasMode.video.current) { return }
                const badApple = new VideoTexture(canvasMode.video.current)
                badApple.magFilter = NearestFilter
                badApple.minFilter = NearestFilter
                canvasMode.video.current.play()
                setNoise(badApple)
        }
    }, [searchParams.page, canvasMode.mode])

    useEffect(() => {
        const cursorHandler = (ev: MouseEvent) => {
            islandGrid.cursor.x = ev.pageX / window.innerWidth * 2 - 1
            islandGrid.cursor.y = -(ev.pageY / window.innerHeight * 2 - 1)
        }

        window.addEventListener("mousemove", cursorHandler)
        return () => {
            window.removeEventListener("mousemove", cursorHandler)
        }
    }, [])

    const ColorResolver = () => {
        return (
            <div
                ref={resolverRef}
                className="bg-dark-1 dark:bg-light-1 border-l-dark-0 border-r-light-0 dark:border-l-light-0 dark:border-r-dark-0"
            />
        )
    }

    const CanvasStateTracker = () => {
        const three = useThree()
        useEffect(() => {
            if (islandGrid.canvasSize != three.size) {
                islandGrid.canvasSize = three.size

                canvasState?.setter("ready")
                console.log(islandGrid.canvasSize, three.size)
            }
        }, [three.size])

        return <></>
    }

    function getGridMode(): GridMode {
        switch (canvasMode.mode) {
            case "islands": return "islands"
            case "bad-apple": return "binary-noise"
        }
    }

    // +0.01 Avoid float point precision issue
    const maxValidNoiseValue = maxValidNoiseValueOverride ?? (islands.length - 1 + 0.01) / islandMapMeta.perPageRegions
    const gridMode = getGridMode()

    return (
        <div
            className="absolute w-[100vw] h-[100vh] cursor-none"
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
            onMouseUp={ev => {
                if (ev.button != 2) { return }

                islandGrid.drag.onDrag = false
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
                const query = await fetchIslandAt(searchParams.page, grid.x, grid.y - 1)
                let result: { regionId: number | null; noiseValue: number }
                if (query.ok && query.data.result && query.data.result.noiseValue < maxValidNoiseValue) {
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
        >
            <ColorResolver />
            <Canvas>
                <CanvasStateTracker />
                <EffectComposer>
                    {
                        colors && noise
                            ? <MainGrid
                                params={{
                                    backgroundColor: colors.background,
                                    lineColor: colors.neutral,
                                    fillColor: colors.foreground,
                                    unfocusColor: new Color("#888888"),
                                    outlineColor: new Color("#42d3ff"),
                                    waveColor: new Color("#296ed6"),
                                    cellSize: GridSettings.cellSize,
                                    thickness: GridSettings.lineThickness,
                                    dash: GridSettings.dash,
                                    focusingValue: islandGrid.focusingRegionValue,
                                    noise,
                                    transform: islandGrid.canvasTransform,
                                    canvasSize: islandGrid.canvasSize,
                                    focusOutlineThickness: GridSettings.focusOutlineThickness,
                                    focusOutlineDist: GridSettings.focusOutlineDist,
                                    waveDir: GridSettings.waveDir,
                                    waveDensity: GridSettings.waveDensity,
                                    waveIntensity: GridSettings.waveIntensity,
                                    waveScale: GridSettings.waveScale,
                                    maxValidNoiseValue: maxValidNoiseValue,
                                    mode: gridMode,
                                }}
                            />
                            : <></>
                    }
                    {
                        colors
                            ?
                            <MouseTracker
                                params={{
                                    color: colors.foreground,
                                    thickness: GridSettings.lineThickness,
                                    blockSize: GridSettings.cellSize,
                                    transform: islandGrid.canvasTransform,
                                    cursorPos: islandGrid.cursor,
                                    canvasSize: islandGrid.canvasSize,
                                }}
                            />
                            : <></>
                    }
                </EffectComposer>
            </Canvas>
        </div>
    )
}
