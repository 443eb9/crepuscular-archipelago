"use client"

import { IslandMeta } from "@/data/model";
import { useContext, useEffect } from "react";
import { GridSettings, islandGridContext } from "./islands-grid";
import { Vector2 } from "three";
import { motion, useMotionValue } from "motion/react";
import OutlinedBox from "@/components/outlined-box";

export default function IslandFloatingInfo({ island, center }: { island: IslandMeta, center: Vector2}) {
    const { canvasSize, canvasTransform } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    useEffect(() => {
        const updateHandler = () => {
            const translation = canvasTransform.translation.clone()
            const scale = canvasTransform.scale
            const size = new Vector2(canvasSize.width, canvasSize.height)

            const uv = center.clone()
                .multiplyScalar(GridSettings.cellSize)
                .sub(translation)
                .divide(size)
                .divideScalar(0.5 * scale)
                .addScalar(1)
                .multiplyScalar(0.5)
            const pixel = new Vector2(uv.x, 1 - uv.y).multiply(size)
            x.set(pixel.x)
            y.set(pixel.y)
        }

        document.addEventListener("mousemove", updateHandler)
        document.addEventListener("wheel", updateHandler)

        return () => {
            document.removeEventListener("mousemove", updateHandler)
            document.addEventListener("wheel", updateHandler)
        }
    })

    return (
        <motion.div
            className="absolute z-10 bg-light-background dark:bg-dark-background"
            style={{ x, y }}
        >
            <OutlinedBox className="p-2 flex items-center gap-2">
                <div className="font-bender font-bold text-2xl mix-blend-difference">#{island.id}</div>
                <div className="font-sh-sans">{island.title}</div>
            </OutlinedBox>
        </motion.div>
    )
}
