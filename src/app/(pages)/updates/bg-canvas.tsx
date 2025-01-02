"use client"

import { InfiniteGrid } from "@/components/canvas/infinite-grid";
import { MouseTracker } from "@/components/canvas/mouse-tracker";
import { islandMapUrl } from "@/data/api";
import { Transform } from "@/data/utils";
import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { Color, TextureLoader } from "three";

export default function BgCanvas({ transform, ...props }: { transform: Transform } & HTMLAttributes<HTMLDivElement>) {
    const resolverRef = useRef<HTMLDivElement>(null)
    const [params, setParams] = useState<{
        gridColor: Color,
        trackerColor: Color,
    } | undefined>()

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
                <EffectComposer>
                    <InfiniteGrid
                        params={{
                            color: params.gridColor,
                            fillColor: params.trackerColor,
                            cellSize: 40,
                            thickness: 2,
                            dash: 3,
                            noise: new TextureLoader().load(islandMapUrl()),
                            transform,
                        }}
                    />
                    <MouseTracker
                        params={{
                            color: params.trackerColor,
                            thickness: 2,
                            blockSize: 40,
                            transform,
                        }}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
