"use client"

import OutlinedBox from "@/components/outlined-box"
import Pagination from "../../components/pagination"
import IslandFilter from "../../components/island-filter"
import { IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandFloatingInfo from "./island-floating-info"
import { Vector2 } from "three"
import CoordIndicator from "./coord-indicator"
import { CanvasMode } from "./main-canvas"
import AsciiText from "@/components/text/ascii-text"
import NavBarButtons from "@/components/nav-bar-buttons"

export const InlinedArticleSuppressBlur = "inlined-article-suppress-blur"

export default function IslandPanels({
    totalIslands, allTags, islands, regionCenters, mode
}: {
    totalIslands: number, allTags: TagData[], islands: IslandMeta[], regionCenters: IslandMapRegionCenters, mode: CanvasMode
}) {
    return (
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
                            ? <Pagination className="w-8 aspect-square" total={totalIslands} />
                            : <AsciiText>Void</AsciiText>
                    }
                </OutlinedBox>
            </div>
            <OutlinedBox className="absolute right-2 top-2 w-72 backdrop-blur-md pointer-events-auto">
                <IslandFilter allTags={allTags} />
            </OutlinedBox>
            <div className="flex w-full justify-center">
                <OutlinedBox className="absolute p-1 gap-2 top-2 backdrop-blur-md pointer-events-auto flex">
                    <NavBarButtons width={80} height={40} />
                </OutlinedBox>
            </div>
            <div className="absolute left-0 bottom-0">
                <CoordIndicator />
            </div>
        </div>
    )
}
