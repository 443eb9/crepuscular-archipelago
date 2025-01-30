"use client"

import { Island, IslandMapMeta, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandPanels from "./island-panels"
import MainCanvas, { CanvasMode } from "./main-canvas"
import { StatefulContext, Transform } from "@/data/utils"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { Vector2 } from "three"
import { Size } from "@react-three/fiber"
import Text from "@/components/text"
import OutlinedButton from "@/components/outlined-button"
import { QueryParams } from "@/data/search-param-util"
import { GridMode } from "./(canvas)/main-grid"
import { TbApple } from "react-icons/tb"
import CanvasRelatedPanel from "./canvas-related-panel"
import BadAppleEntrance from "./bad-apple-entrance"
import toast from "react-hot-toast"

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

export type CanvasState = "ready" | "pending"

export const canvasStateContext = createContext<StatefulContext<CanvasState> | undefined>(undefined)

export default function IslandsMap(props: { islands: IslandMeta[], islandMapMeta: IslandMapMeta, regionCenters: IslandMapRegionCenters, totalIslands: number, allTags: TagData[], params: QueryParams }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [visitingIsland, setVisitingIsland] = useState<VisitingIsland | undefined>(undefined)
    const [canvasState, setCanvasState] = useState<CanvasState>("pending")
    const islandGrid = useContext(islandGridContext)
    const [canvasMode, setCanvasMode] = useState<CanvasMode>({ mode: "islands" })

    const [mobile, setMobile] = useState<boolean | undefined>(false)

    useEffect(() => {
        const resizeHandler = () => {
            if (window.innerWidth < window.innerHeight && mobile != undefined) {
                setMobile(true)
            } else {
                setMobile(false)
            }
        }

        resizeHandler()
        window.addEventListener("resize", resizeHandler)

        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.5
        }
    }, [canvasMode])

    return (
        <islandGridContext.Provider value={islandGrid}>
            <visitingIslandContext.Provider value={{ value: visitingIsland, setter: setVisitingIsland }}>
                <canvasStateContext.Provider value={{ value: canvasState, setter: setCanvasState }}>
                    <div className="absolute w-[100vw] h-[100vh] overflow-hidden">
                        {
                            canvasMode.mode == "bad-apple" &&
                            <video
                                ref={videoRef}
                                src="videos/bad-apple.mp4"
                                className="absolute -z-[100000]"
                                controls
                            />
                        }
                        {
                            canvasState == "ready" && canvasMode.mode == "islands" &&
                            <BadAppleEntrance enter={() => {
                                toast("请在 5 秒内调低你的音量至合适的大小，避免被吓到")
                                islandGrid.canvasTransform.translation.x = 0
                                islandGrid.canvasTransform.translation.y = 0
                                setTimeout(() => {
                                    setCanvasMode({ mode: "bad-apple", video: videoRef })
                                }, 5000)
                            }} />
                        }
                        {
                            mobile != true
                                ? <>
                                    {
                                        canvasState == "ready" &&
                                        <IslandPanels
                                            currentPage={props.params.page}
                                            totalPages={Math.ceil(props.totalIslands / props.islandMapMeta.perPageRegions)}
                                            params={props.params}
                                            allTags={props.allTags}
                                            regionCenters={props.regionCenters}
                                            islands={props.islands}
                                            mode={canvasMode}
                                        />
                                    }
                                    <MainCanvas
                                        islands={props.islands}
                                        islandMapMeta={props.islandMapMeta}
                                        params={props.params}
                                        maxValidNoiseValueOverride={canvasMode.mode == "bad-apple" ? 0.5 : undefined}
                                        canvasMode={canvasMode}
                                    />
                                </>
                                : <div>
                                    <Text>正在使用竖屏设备，可能无法正常显示内容。另外，触屏设备无法正常使用本页面。</Text>
                                    <div className="flex items-center">
                                        <Text>你可以使用更大的屏幕浏览，或者</Text>
                                        <OutlinedButton onClick={() => setMobile(undefined)}>强制渲染</OutlinedButton>
                                    </div>
                                </div>
                        }
                    </div>
                </canvasStateContext.Provider>
            </visitingIslandContext.Provider>
        </islandGridContext.Provider>
    )
}
