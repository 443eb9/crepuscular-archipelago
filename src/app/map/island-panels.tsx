"use client"

import OutlinedBox from "@/components/outlined-box"
import Pagination from "../../components/pagination"
import IslandFilter from "../../components/island-filter"
import { IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import Text from "@/components/text"
import { useContext, useEffect } from "react"
import { visitingIslandContext } from "./islands-map"
import InlinedArticle from "./inlined-article"
import NavButtons from "../(pages)/nav-buttons"
import ThemeSwither from "@/components/theme-switcher"
import { QueryParams } from "@/data/search-param-util"
import ContentWrapper from "@/components/content-wrapper"
import { findClassNameAmong } from "@/data/utils"
import IslandFloatingInfo from "./island-floating-info"
import { Vector2 } from "three"
import CoordIndicator from "./coord-indicator"
import { CanvasMode } from "./main-canvas"

const InlinedArticleSuppressBlur = "inlined-article-suppress-blur"

export default function IslandPanels({
    totalPages, currentPage, params, allTags, islands, regionCenters, mode
}: {
    totalPages: number, currentPage: number, params: QueryParams, allTags: TagData[], islands: IslandMeta[], regionCenters: IslandMapRegionCenters, mode: CanvasMode
}) {
    const visitingIsland = useContext(visitingIslandContext)

    useEffect(() => {
        const blurHandler = (ev: MouseEvent) => {
            if (!findClassNameAmong(ev.target as HTMLElement, InlinedArticleSuppressBlur)) {
                visitingIsland?.setter(undefined)
            }
        }

        document.addEventListener("mousedown", blurHandler)
        return () => {
            document.removeEventListener("mousedown", blurHandler)
        }
    }, [])

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
                                params={params}
                            />
                        )
                    })
                }
            </div>
            <div className="absolute left-2 top-2 flex flex-col gap-2">
                <OutlinedBox className="pointer-events-auto backdrop-blur aspect-square flex items-center justify-center">
                    <ThemeSwither />
                </OutlinedBox>
                <OutlinedBox className="flex flex-col gap-2 p-2 backdrop-blur-md pointer-events-auto">
                    {
                        totalPages > 0
                            ? <Pagination total={totalPages} current={currentPage} buttonSize={36} params={params} />
                            : <Text className="font-bender font-bold">Void</Text>
                    }
                </OutlinedBox>
            </div>
            <OutlinedBox className="absolute right-2 top-2 w-72 backdrop-blur-md pointer-events-auto">
                <IslandFilter params={params} allTags={allTags} />
            </OutlinedBox>
            {
                visitingIsland?.value &&
                <div className="absolute z-50 w-full h-full flex justify-center items-center pointer-events-auto">
                    <div className="absolute -z-10 w-full h-full bg-black opacity-50" />
                    <ContentWrapper containerClassName="overflow-y-auto h-[95%]" className={InlinedArticleSuppressBlur}>
                        <div className="bg-light-background dark:bg-dark-background w-full">
                            <InlinedArticle
                                meta={visitingIsland.value.meta}
                                content={visitingIsland.value.content.content}
                                params={params}
                            />
                        </div>
                    </ContentWrapper>
                </div>
            }
            <div className="flex w-full justify-center">
                <OutlinedBox className="absolute p-1 top-2 backdrop-blur-md pointer-events-auto">
                    <NavButtons className="w-16 h-12 p-1" />
                </OutlinedBox>
            </div>
            <div className="absolute left-0 bottom-0">
                <CoordIndicator />
            </div>
        </div>
    )
}
