"use client"

import { Island, IslandMapMeta, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandPanels from "./island-panels"
import IslandsGrid from "./islands-grid"
import { QueryParams, StatefulContext, Transform } from "@/data/utils"
import { createContext, useContext, useEffect, useState } from "react"
import { Vector2 } from "three"
import { Size } from "@react-three/fiber"
import Text from "@/components/text"
import OutlinedButton from "@/components/outlined-button"

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

    const [lowResolution, setLowResolution] = useState<boolean | undefined>(false)

    useEffect(() => {
        const resizeHandler = () => {
            const width = window.innerWidth
            const height = window.innerHeight

            if ((width < 1024 || height < 768) && lowResolution != undefined) {
                setLowResolution(true)
            } else {
                setLowResolution(false)
            }
        }

        window.addEventListener("resize", resizeHandler)
        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])

    return (
        <islandGridContext.Provider value={islandGrid}>
            <visitingIslandContext.Provider value={{ value: visitingIsland, setter: setVisitingIsland }}>
                <div className="w-[100vw] h-[100vh]">
                    {
                        lowResolution != true
                            ? <>
                                <IslandPanels
                                    currentPage={props.params.page}
                                    totalPages={Math.ceil(props.totalIslands / props.islandMapMeta.perPageRegions)}
                                    params={props.params}
                                    allTags={props.allTags}
                                />
                                <IslandsGrid
                                    islands={props.islands}
                                    islandMapMeta={props.islandMapMeta}
                                    regionCenters={props.regionCenters}
                                    params={props.params}
                                />
                            </>
                            : <div className="">
                                <Text>分辨率过低，可能无法正常显示内容</Text>
                                <div className="flex items-center">
                                    <Text>你可以使用更大的屏幕浏览，或者</Text>
                                    <OutlinedButton onClick={() => setLowResolution(undefined)}>强制渲染</OutlinedButton>
                                </div>
                            </div>
                    }
                </div>
            </visitingIslandContext.Provider>
        </islandGridContext.Provider>
    )
}
