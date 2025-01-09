"use client"

import { Island, IslandMapMeta, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandPanels from "./island-panels"
import IslandsGrid from "./islands-grid"
import { QueryParams, StatefulContext, Transform } from "@/data/utils"
import { createContext, useContext, useState } from "react"
import { Vector2 } from "three"
import { Size } from "@react-three/fiber"

type VisitingIsland = { meta: IslandMeta, content: Island }

export const visitingIslandContext = createContext<StatefulContext<VisitingIsland | undefined> | undefined>(undefined)

export type IslandGridContext = {
    cursor: Vector2,
    canvasSize: Size,
    drag: {
        onDrag: boolean,
        cursor: Vector2,
        canvas: Vector2,
    },
    canvasTransform: Transform,
    focusingRegionId: {
        value: number | null,
    },
    focusingRegionValue: {
        value: number,
    },
}

export const islandGridContext = createContext<IslandGridContext>({
    cursor: new Vector2(),
    canvasSize: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    },
    drag: {
        onDrag: false,
        cursor: new Vector2(),
        canvas: new Vector2(),
    },
    canvasTransform: {
        translation: new Vector2(),
        scale: 1,
    },
    focusingRegionId: {
        value: null,
    },
    focusingRegionValue: {
        value: 1.0,
    },
})

export default function IslandsMap(props: { islands: IslandMeta[], islandMapMeta: IslandMapMeta, regionCenters: IslandMapRegionCenters, totalIslands: number, allTags: TagData[], params: QueryParams }) {
    const [visitingIsland, setVisitingIsland] = useState<VisitingIsland | undefined>(undefined)
    const islandGrid = useContext(islandGridContext)

    return (
        <islandGridContext.Provider value={islandGrid}>
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
        </islandGridContext.Provider>
    )
}
