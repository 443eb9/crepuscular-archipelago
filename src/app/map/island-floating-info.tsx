"use client"

import { Island, IslandMeta } from "@/data/model"
import { useContext, useEffect, useState } from "react"
import { Vector2 } from "three"
import { useMotionValue } from "motion/react"
import OutlinedBox from "@/components/outlined-box"
import { fetchIsland } from "@/data/api"
import { islandGridContext } from "./islands-map"
import CanvasRelatedPanel from "./canvas-related-panel"
import AsciiText from "@/components/text/ascii-text"
import IslandCard from "@/components/island-card"
import BodyText from "@/components/text/body-text"

export default function IslandFloatingInfo({ regionId, island, center }: { regionId: number, island: IslandMeta, center: Vector2 }) {
    const { focusingRegionId } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const [state, setState] = useState<"focused" | "unfocused" | "none">("none")

    const [islandContent, setIslandContent] = useState<Island | undefined>()

    useEffect(() => {
        const update = async () => {
            if (focusingRegionId.value == null) {
                setState("none")
            } else if (focusingRegionId.value == regionId) {
                setState("focused")

                if (island.ty == "note" && !islandContent) {
                    const content = await fetchIsland(island.id)
                    if (content.ok) {
                        setIslandContent(content.data)
                    }
                }
            } else {
                setState("unfocused")
            }
        }

        const id = window.setInterval(update, 100)
        return () => {
            window.clearInterval(id)
        }
    }, [islandContent])

    return (
        <CanvasRelatedPanel
            posX={center.x}
            posY={center.y}
            className="absolute bg-light-0 dark:bg-dark-0"
            style={{
                x,
                y,
                zIndex: state == "focused" ? "10" : "0",
                opacity: state == "unfocused" ? 0.5 : 1,
            }}
        >
            {
                island.state == "deleted"
                    ? <OutlinedBox className="font-bender font-bold text-xl p-2" style={{ borderStyle: "dashed" }}>
                        <AsciiText>Access Denied</AsciiText>
                    </OutlinedBox>
                    : state == "focused"
                        ? <div className={`absolute w-[500px] bg-light-0 dark:bg-dark-0 pointer-events-auto ${island.ty == "article" ? "cursor-pointer" : ""}`}>
                            <IslandCard island={island} content={islandContent} />
                        </div>
                        : <OutlinedBox className="p-2 flex items-center gap-2">
                            <AsciiText>#{island.id}</AsciiText>
                            <BodyText>{island.title}</BodyText>
                        </OutlinedBox>
            }
        </CanvasRelatedPanel>
    )
}
