"use client"

import { InfiniteGrid } from "@/components/canvas/infinite-grid";
import { MouseTracker } from "@/components/canvas/mouse-tracker";
import { islandMapUrl } from "@/data/api";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { HTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { Color, NearestFilter, Texture, TextureLoader, Vector2 } from "three";
import { GridSettings, islandGridContext } from "./islands-grid";

export default function BgCanvas(props: HTMLAttributes<HTMLDivElement>) {
    const resolverRef = useRef<HTMLDivElement>(null)
    const [params, setParams] = useState<{
        gridColor: Color,
        trackerColor: Color,
    } | undefined>()
    const islandGrid = useContext(islandGridContext)
    const [noise, setNoise] = useState<Texture | undefined>()
    const [updateFlag, setUpdateFlag] = useState(false)

    useEffect(() => {
        if (resolverRef.current) {
            const style = window.getComputedStyle(resolverRef.current)
            setParams({
                gridColor: new Color(style.borderColor),
                trackerColor: new Color(style.backgroundColor),
            })
        }
    }, [])

    useEffect(() => {
        const noise = new TextureLoader().load(islandMapUrl())
        noise.magFilter = NearestFilter
        noise.minFilter = NearestFilter
        setNoise(noise)
    }, [])

    const ColorResolver = () =>
        <div className="bg-light-contrast dark:bg-dark-contrast border-light-dark-neutral" ref={resolverRef} />

    const CanvasStateTracker = () => {
        const three = useThree()
        useEffect(() => {
            if (islandGrid.cursor != three.pointer || islandGrid.canvasSize != three.size) {
                islandGrid.cursor = three.pointer
                islandGrid.canvasSize = three.size
                setUpdateFlag(!updateFlag)
            }
        }, [])

        return <></>
    }

    if (!params || !noise) {
        return <ColorResolver />
    }

    return (
        <div
            {...props}
            className={`absolute w-[100vw] h-[100vh] ${props.className}`}
        >
            <ColorResolver />
            <Canvas>
                <CanvasStateTracker />
                <EffectComposer>
                    <InfiniteGrid
                        params={{
                            color: params.gridColor,
                            fillColor: params.trackerColor,
                            focusColor: params.gridColor,
                            cellSize: GridSettings.cellSize,
                            thickness: GridSettings.lineThickness,
                            dash: GridSettings.dash,
                            focusingValue: islandGrid.focusingIslandValue,
                            noise,
                            transform: islandGrid.canvasTransform,
                            canvasSize: islandGrid.canvasSize,
                            focusOutline: GridSettings.focusOutline,
                        }}
                    />
                    <MouseTracker
                        params={{
                            color: params.trackerColor,
                            thickness: GridSettings.lineThickness,
                            blockSize: GridSettings.cellSize,
                            transform: islandGrid.canvasTransform,
                            cursorPos: islandGrid.cursor,
                            canvasSize: islandGrid.canvasSize,
                        }}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
