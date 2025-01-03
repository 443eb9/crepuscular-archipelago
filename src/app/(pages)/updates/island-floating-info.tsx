"use client"

import { IslandMeta } from "@/data/model";
import { useContext, useEffect, useState } from "react";
import { GridSettings, islandGridContext } from "./islands-grid";
import { Vector2 } from "three";
import { motion, useMotionValue } from "motion/react";
import OutlinedBox from "@/components/outlined-box";
import IslandCard from "./island-card";
import Text from "@/components/text";

export default function IslandFloatingInfo({ island, center }: { island: IslandMeta, center: Vector2 }) {
    const { canvasSize, canvasTransform, focusingIslandId } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const [state, setState] = useState<"focused" | "unfocused" | "none">("none")

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

            if (focusingIslandId.value == null) {
                setState("none")
            } else if (focusingIslandId.value == island.id) {
                setState("focused")
            } else {
                setState("unfocused")
            }
        }

        document.addEventListener("mousemove", updateHandler)
        document.addEventListener("mousedown", updateHandler)
        document.addEventListener("wheel", updateHandler)

        return () => {
            document.removeEventListener("mousemove", updateHandler)
            document.addEventListener("mousedown", updateHandler)
            document.addEventListener("wheel", updateHandler)
        }
    })

    return (
        <motion.div
            className="absolute bg-light-background dark:bg-dark-background"
            style={{
                x,
                y,
                zIndex: state == "focused" ? "10" : "0",
                opacity: state == "unfocused" ? 0.5 : 1,
            }}
        >
            {
                state == "focused"
                    ? <div className="absolute w-[500px] bg-light-background dark:bg-dark-background"><IslandCard island={island} /></div>
                    : <OutlinedBox className="p-2 flex items-center gap-2">
                        <Text className="font-bender font-bold text-2xl mix-blend-difference" noFont>#{island.id}</Text>
                        <Text className="font-sh-sans">{island.title}</Text>
                    </OutlinedBox>
            }
        </motion.div>
    )
}
