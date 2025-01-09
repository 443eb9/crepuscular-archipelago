"use client"

import { InfiniteGrid } from "@/app/map/infinite-grid";
import { MouseTracker } from "@/app/map/mouse-tracker";
import { islandMapUrl } from "@/data/api";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { HTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { Color, NearestFilter, Texture, TextureLoader } from "three";
import { GridSettings, islandGridContext } from "./islands-grid";

export default function BgCanvas({
    onReady, mapPage, maxValidNoiseValue, ...props
}: {
    onReady: () => void, mapPage: number, maxValidNoiseValue: number
} & HTMLAttributes<HTMLDivElement>) {
    const resolverRef = useRef<HTMLDivElement>(null)
    const [colors, setColors] = useState<{
        contrastColor: Color,
        neutralColor: Color,
    } | undefined>()
    const islandGrid = useContext(islandGridContext)
    const [noise, setNoise] = useState<Texture | undefined>()
    const [updateFlag, setUpdateFlag] = useState(false)

    useEffect(() => {
        if (resolverRef.current) {
            const style = window.getComputedStyle(resolverRef.current)
            setColors({
                contrastColor: new Color(style.borderColor),
                neutralColor: new Color(style.backgroundColor),
            })
        }
    }, [])

    useEffect(() => {
        const noise = new TextureLoader().load(islandMapUrl(mapPage))
        noise.magFilter = NearestFilter
        noise.minFilter = NearestFilter
        setNoise(noise)
    }, [])

    const ColorResolver = () =>
        <div
            ref={resolverRef}
            className="bg-light-contrast dark:bg-dark-contrast border-light-dark-neutral"
        />

    const CanvasStateTracker = () => {
        const three = useThree()
        useEffect(() => {
            if (islandGrid.cursor != three.pointer || islandGrid.canvasSize != three.size) {
                islandGrid.cursor = three.pointer
                islandGrid.canvasSize = three.size

                setUpdateFlag(!updateFlag)
                onReady()
            }
        }, [])

        return <></>
    }

    if (!colors || !noise) {
        return <ColorResolver />
    }

    return (
        <div
            {...props}
            className={`absolute w-[100vw] h-[100vh] cursor-none ${props.className}`}
        >
            <ColorResolver />
            <Canvas>
                <CanvasStateTracker />
                <EffectComposer>
                    <InfiniteGrid
                        params={{
                            lineColor: new Color(0.1, 0.1, 0.1),
                            fillColor: colors.neutralColor,
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
                        }}
                    />
                    <MouseTracker
                        params={{
                            color: colors.neutralColor,
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
