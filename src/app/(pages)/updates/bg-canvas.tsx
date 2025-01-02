"use client"

import { InfiniteGrid } from "@/components/canvas/infinite-grid";
import { MouseTracker } from "@/components/canvas/mouse-tracker";
import { islandMapUrl } from "@/data/api";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { HTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { Color, TextureLoader } from "three";
import { islandGridContext } from "./islands-grid";

export default function BgCanvas(props: HTMLAttributes<HTMLDivElement>) {
    const resolverRef = useRef<HTMLDivElement>(null)
    const [params, setParams] = useState<{
        gridColor: Color,
        trackerColor: Color,
    } | undefined>()
    const islandGrid = useContext(islandGridContext)
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

    if (!params) {
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
                            cellSize: 40,
                            thickness: 2,
                            dash: 3,
                            noise: new TextureLoader().load(islandMapUrl()),
                            transform: islandGrid.canvasTransform,
                        }}
                    />
                    <MouseTracker
                        params={{
                            color: params.trackerColor,
                            thickness: 2,
                            blockSize: 40,
                            transform: islandGrid.canvasTransform,
                            cursorPos: islandGrid.cursor,
                        }}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
