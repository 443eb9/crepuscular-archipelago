"use client"

import { IslandMeta } from "@/data/model"
import { useContext, useEffect, useState } from "react"
import { Vector2 } from "three"
import { useMotionValue } from "motion/react"
import OutlinedBox from "@/components/outlined-box"
import Text from "@/components/text"
import IslandCard from "../../components/card/island-card"
import { fetchIsland } from "@/data/api"
import { islandGridContext, visitingIslandContext } from "./islands-map"
import clsx from "clsx"
import { QueryParams } from "@/data/search-param-util"
import CanvasRelatedPanel from "./canvas-related-panel"

export default function IslandFloatingInfo({ regionId, island, center, params }: { regionId: number, island: IslandMeta, center: Vector2, params: QueryParams }) {
    const { focusingRegionId } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const [state, setState] = useState<"focused" | "unfocused" | "none">("none")

    const visitingIsland = useContext(visitingIslandContext)
    const islandGrid = useContext(islandGridContext)
    const [islandContent, setIslandContent] = useState<string | undefined>()

    useEffect(() => {
        const update = async () => {
            if (focusingRegionId.value == null) {
                setState("none")
            } else if (focusingRegionId.value == regionId) {
                setState("focused")

                if (island.ty == "note" && !islandContent) {
                    const content = await fetchIsland(island.id)
                    if (content.ok) {
                        setIslandContent(content.data.content)
                    }
                }
            } else {
                setState("unfocused")
            }
        }

        window.setInterval(update, 100)
    }, [regionId, islandContent, island.id])

    return (
        <CanvasRelatedPanel
            posX={center.x}
            posY={center.y}
            className="absolute bg-light-background dark:bg-dark-background"
            style={{
                x,
                y,
                zIndex: state == "focused" ? "10" : "0",
                opacity: state == "unfocused" ? 0.5 : 1,
            }}
        >
            {
                island.isDeleted
                    ? <OutlinedBox className="font-bender font-bold text-xl p-2" style={{ borderStyle: "dashed" }}>
                        <Text className="font-bender" noFont>Access Denied</Text>
                    </OutlinedBox>
                    : state == "focused"
                        ? <div
                            className={clsx("absolute w-[500px] bg-light-background dark:bg-dark-background", { "cursor-pointer": island.ty == "article" })}
                            onClick={async () => {
                                if (visitingIsland?.value?.meta.id != island.id && island.ty == "article") {
                                    const content = await fetchIsland(island.id)
                                    if (content.ok) {
                                        visitingIsland?.setter({
                                            meta: island,
                                            content: content.data,
                                        })
                                    }

                                    islandGrid.focusingRegionValue.value = 1
                                    islandGrid.focusingRegionId.value = null
                                }
                            }}
                        >
                            <IslandCard island={island} content={islandContent} params={params} noLink />
                        </div>
                        : <OutlinedBox className="p-2 flex items-center gap-2">
                            <Text className="font-bender font-bold text-2xl" noFont>#{island.id}</Text>
                            <Text className="font-sh-sans">{island.title}</Text>
                        </OutlinedBox>
            }
        </CanvasRelatedPanel>
    )
}
