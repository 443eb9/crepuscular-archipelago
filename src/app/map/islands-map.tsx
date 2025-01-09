"use client"

import { Island, IslandMapMeta, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandPanels from "./island-panels"
import IslandsGrid from "./islands-grid"
import { QueryParams, StatefulContext } from "@/data/utils"
import { createContext, useState } from "react"

type VisitingIsland = { meta: IslandMeta, content: Island }

export const visitingIslandContext = createContext<StatefulContext<VisitingIsland | undefined> | undefined>(undefined)

export default function IslandsMap(props: { islands: IslandMeta[], islandMapMeta: IslandMapMeta, regionCenters: IslandMapRegionCenters, totalIslands: number, allTags: TagData[], params: QueryParams }) {
    const [visitingIsland, setVisitingIsland] = useState<VisitingIsland | undefined>(undefined)

    return (
        <visitingIslandContext.Provider value={{ value: visitingIsland, setter: setVisitingIsland }}>
            <div className="w-[100vw] h-[100vh]">
                <IslandPanels
                    currentPage={props.params.page}
                    totalPages={Math.ceil(props.totalIslands / props.islandMapMeta.perPageRegions)}
                    queryParams={props.params}
                    allTags={props.allTags}
                />
                <IslandsGrid
                    islands={props.islands}
                    islandMapMeta={props.islandMapMeta}
                    regionCenters={props.regionCenters}
                    currentPage={props.params.page}
                />
            </div>
        </visitingIslandContext.Provider>
    )
}
