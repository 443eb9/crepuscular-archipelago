"use client"

import { Island, IslandMapMeta, IslandMapRegionCenters, IslandMeta, TagData } from "@/data/model"
import IslandPanels from "./island-panels"
import MainCanvas, { CanvasMode } from "./main-canvas"
import { StatefulContext, Transform } from "@/data/utils"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { Vector2 } from "three"
import { Size } from "@react-three/fiber"
import OutlinedButton from "@/components/outlined-button"
import BadAppleEntrance from "./bad-apple-entrance"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import BodyText from "@/components/text/body-text"

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
    const [canvasState, setCanvasState] = useState<CanvasState>("pending")
    const islandGrid = useContext(islandGridContext)
    const [canvasMode, setCanvasMode] = useState<CanvasMode>({ mode: "islands" })
    const router = useRouter()

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

    const MainContent = () => {
        return (
            <>
                {
                    canvasState == "ready" &&
                    <IslandPanels
                        totalIslands={props.totalIslands}
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
        )
    }

    const MobileFallback = () => {
        return (
            <div className="flex flex-col">
                <BodyText>正在使用竖屏设备，可能无法正常显示内容。另外，触屏设备由于使用的事件不同，无法正常使用本页面。</BodyText>
                <div className="flex items-center">
                    <BodyText>你可以使用宽屏电脑浏览，</BodyText>
                    <OutlinedButton onClick={router.back}>返回</OutlinedButton>
                    <BodyText>，或者</BodyText>
                    <OutlinedButton onClick={() => setMobile(undefined)}>强制渲染</OutlinedButton>
                </div>
            </div>
        )
    }

    return (
        <islandGridContext.Provider value={islandGrid}>
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
                        mobile != true ? <MainContent /> : <MobileFallback />
                    }
                </div>
            </canvasStateContext.Provider>
        </islandGridContext.Provider>
    )
}
