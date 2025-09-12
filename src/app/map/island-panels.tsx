"use client"

import OutlinedBox from "@/components/outlined-box"
import Pagination from "../../components/pagination"
import IslandFilter from "../../components/island-filter"
import { Island, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import { createContext, useEffect, useState } from "react"
import { findClassNameAmong, StatefulContext } from "@/data/utils"
import IslandFloatingInfo from "./island-floating-info"
import { Vector2 } from "three"
import CoordIndicator from "./coord-indicator"
import { CanvasMode } from "./main-canvas"
import AsciiText from "@/components/text/ascii-text"
import NavBarButtons from "@/components/nav-bar-buttons"

export const InlinedArticleSuppressBlur = "inlined-article-suppress-blur"

type VisitingIsland = { meta: IslandMeta, content: Island }

export const visitingIslandContext = createContext<StatefulContext<VisitingIsland | undefined> | undefined>(undefined)

export default function IslandPanels({
    totalIslands, allTags, islands, regionCenters, mode
}: {
    totalIslands: number, allTags: TagData[], islands: IslandMeta[], regionCenters: IslandMapRegionCenters, mode: CanvasMode
}) {
    console.log(totalIslands)
    const [visitingIsland, setVisitingIsland] = useState<VisitingIsland | undefined>(undefined)

    useEffect(() => {
        const blurHandler = (ev: MouseEvent) => {
            if (!findClassNameAmong(ev.target as HTMLElement, InlinedArticleSuppressBlur)) {
                setVisitingIsland(undefined)
            }
        }

        document.addEventListener("mousedown", blurHandler)
        return () => {
            document.removeEventListener("mousedown", blurHandler)
        }
    }, [])

    return (
        <visitingIslandContext.Provider value={{ value: visitingIsland, setter: setVisitingIsland }}>
            <div className="absolute z-50 w-[100vw] h-[100vh] pointer-events-none">
                <div className="absolute w-[100vw] h-[100vh] overflow-hidden">
                    {
                        mode.mode == "islands" && islands.map((island, index) => {
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
                <div className="absolute left-2 top-2 flex flex-col gap-2">
                    <OutlinedBox className="flex flex-col gap-2 p-2 backdrop-blur-md pointer-events-auto">
                        {
                            totalIslands > 0
                                ? <Pagination className="w-8 aspect-square" total={totalIslands}  />
                                : <AsciiText>Void</AsciiText>
                        }
                    </OutlinedBox>
                </div>
                <OutlinedBox className="absolute right-2 top-2 w-72 backdrop-blur-md pointer-events-auto">
                    <IslandFilter allTags={allTags} />
                </OutlinedBox>
                {/* <InlinedArticle params={params} /> */}
                <div className="flex w-full justify-center">
                    <OutlinedBox className="absolute p-1 gap-2 top-2 backdrop-blur-md pointer-events-auto flex">
                        <NavBarButtons width={80} height={40}/>
                    </OutlinedBox>
                </div>
                <div className="absolute left-0 bottom-0">
                    <CoordIndicator />
                </div>
            </div>
        </visitingIslandContext.Provider>
    )
}
