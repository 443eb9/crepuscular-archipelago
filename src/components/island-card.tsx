"use client"

import { Island, IslandMeta } from "@/data/model";
import RectDot from "./rect-dot";
import TitleText from "./text/title-text";
import BodyText from "./text/body-text";
import CornerDecoBox from "./corner-deco-box";
import AsciiText from "./text/ascii-text";
import EndDecoLine from "./end-deco-line";
import FocusRect from "./svg-deco/focus-rect";
import Tag from "./tag";
import { constructPath, formatDate, formatLicense, formatState } from "@/data/utils";
import CcIcons from "./svg-deco/cc-icons";
import { OSS } from "@/data/endpoints";
import IslandBody from "./island-body";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import AnimEnterBlink from "./anim/anim-enter-blink";

export default function IslandCard({ island, content }: { island: IslandMeta, content?: Island }) {
    const FakeBarCode = ({ len }: { len: number }) => {
        let acc = 0
        let i = 0
        const res = []
        const colors = ["bg-accent-0", "bg-light-0 dark:bg-dark-0"]
        while (true) {
            const t = Math.pow(Math.random(), 2) * 10
            if (acc + t > len) break

            res.push(
                <div key={i} className={colors[i % 2]} style={{ height: `${t}px` }}></div>
            )
            acc += t
            i++
        }
        return res
    }

    const router = useRouter()
    const [loaded, setLoaded] = useState<boolean | null>(null)
    const params = useSearchParams()

    const handleIslandEntrance = async () => {
        const path = island.ty == "external" ? island.reference : constructPath(`/island/${island.id}`, params)
        if (!path) {
            return
        }

        setLoaded(false)
        await fetch(path)
        setLoaded(true)
        setTimeout(() => router.push(path), 1000)
    }

    if (island.state == "deleted") {
        return (
            <div className="flex h-16">
                <div className="relative">
                    <div className="absolute bg-dark-0 dark:bg-light-0 h-full w-2 -left-5" />
                    <div className="flex justify-center items-center h-full aspect-square bg-dark-0 dark:bg-light-0">
                        <AsciiText className="text-sm italic -ml-1 font-bold" inv>Dst</AsciiText>
                    </div>
                </div>
                <div className="flex items-center w-full h-full bg-accent-0">
                    <AsciiText className="ml-2 font-bold">INVALID TICKET: Destination access denied.</AsciiText>
                </div>
            </div>
        )
    }

    return (
        <AnimEnterBlink key={island.id}>
            <CornerDecoBox
                decoSize={10}
                lineThickness={2}
                decoGap={10}
                tr={{ node: <RectDot size={10} /> }}
                br={{ node: <RectDot size={10} /> }}
            >
                <AnimatePresence>
                    {
                        loaded != null &&
                        <motion.div
                            initial={{ width: "0" }}
                            animate={{ width: "100%", transition: { duration: 0.5, ease: "easeOut" } }}
                            className="absolute z-10 h-full flex justify-start items-center m-[1px] bg-dark-0 dark:bg-light-0"
                        >
                            <div className="flex flex-col ml-4 overflow-hidden">
                                <div className="relative">
                                    {
                                        loaded &&
                                        <motion.div
                                            initial={{ width: "0" }}
                                            animate={{ width: "100%", transition: { duration: 0.5, ease: "easeOut" } }}
                                            className="absolute overflow-hidden"
                                        >
                                            <AsciiText className="text-2xl w-full italic font-bold whitespace-nowrap bg-accent-0" inv>Success</AsciiText>
                                        </motion.div>
                                    }
                                    <AsciiText className="text-2xl w-full italic font-bold whitespace-nowrap" inv>Loading Destination...</AsciiText>
                                </div>
                                <AsciiText className="text-lg" inv>#{island.id}</AsciiText>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
                {
                    island.ty == "achievement"
                        ? <AsciiText className="absolute -top-6 h-6 px-2 text-sm bg-accent-0 content-center">Island Achievement</AsciiText>
                        : <>
                            <RectDot size={16} className="absolute -left-4 -top-4" />
                            <div className="absolute flex gap-2 ml-2 -top-[10px]">
                                <RectDot size={10} cnt={5} />
                            </div>
                            <div className="absolute w-[6px] h-48 bg-dark-0 dark:bg-light-0 -right-3 top-4 max-h-[60%]" />
                            <div className="absolute flex flex-col items-center w-4 -left-4 border border-dashed border-dark-0 dark:border-light-0">
                                <AsciiText className="text-[8pt] m-4 font-bold" style={{ writingMode: "vertical-lr", rotate: "180deg" }}>
                                    {(
                                        () => {
                                            switch (island.ty) {
                                                case "article": return "WARP TICKET"
                                                case "note": return "INVALID DESTINATION"
                                                case "external": return "HYPER SPACE"
                                            }
                                        }
                                    )()}
                                </AsciiText>
                                <div className="flex w-full h-10 bg-dark-0 dark:bg-light-0" />
                            </div>
                        </>
                }
                <div className={`flex flex-col gap-2 p-4 ${island.ty == "article" || island.ty == "note" ? "min-h-[240px]" : ""}`}>
                    <div
                        className={`flex flex-grow justify-between gap-2 ${island.ty != "note" ? "cursor-pointer": ""}`}
                        onClick={island.ty != "note" ? handleIslandEntrance : undefined}
                    >
                        <div className="flex flex-col flex-grow gap-2">
                            {
                                island.banner &&
                                <div className="">
                                    <AsciiText className="absolute bg-dark-0 dark:bg-light-0 px-2 text-[8pt]" inv>DESTINATION PREVIEW</AsciiText>
                                    <img src={`${OSS}/${island.id}/BANNER.avif`} className="border border-dark-0 dark:border-light-0" />
                                </div>
                            }
                            <div className="flex gap-2 min-h-8">
                                {
                                    island.ty == "achievement"
                                        ? <div className="w-2 bg-dark-0 dark:bg-light-0" />
                                        : <div className="flex h-8">
                                            <div className="relative">
                                                <div className="flex justify-center items-center h-full aspect-square bg-dark-0 dark:bg-light-0">
                                                    <AsciiText className="text-sm italic -ml-1 font-bold" inv>Dst</AsciiText>
                                                </div>
                                            </div>
                                            <div className="flex items-center w-14 h-full bg-accent-0">
                                                <AsciiText className="ml-2">#{island.id}</AsciiText>
                                            </div>
                                        </div>
                                }
                                <TitleText
                                    className={`text-lg ${island.ty == "note" ? "cursor-pointer": ""}`}
                                    onClick={island.ty == "note" ? handleIslandEntrance : undefined}
                                >
                                    {island.title}
                                </TitleText>
                            </div>
                            {(
                                () => {
                                    switch (island.ty) {
                                        case "article": return <div className="flex flex-grow gap-2">
                                            <div className="flex flex-col">
                                                <div className="bg-dark-0 dark:bg-light-0 w-2 mb-2 h-6" />
                                                <div className="bg-dark-0 dark:bg-light-0 w-2 flex flex-grow min-h-2" />
                                                <div className="bg-dark-0 dark:bg-light-0 w-2 mt-3 h-8" />
                                            </div>
                                            {
                                                island.desc
                                                    ? <BodyText>{island.desc}</BodyText>
                                                    : <AsciiText className="opacity-50">No description available</AsciiText>
                                            }
                                        </div>
                                        case "note": return content ? <IslandBody island={content} /> : null
                                        case "achievement":
                                        case "external":
                                    }
                                }
                            )()}
                        </div>
                        {
                            island.ty != "external" && island.ty != "achievement" &&
                            <div>
                                <div className="flex flex-col w-6 h-full justify-between bg-accent-0 self-end">
                                    <div className="flex-col w-4/5 self-end pr-[2px] pt-[2px] h-[50px]">
                                        <FakeBarCode len={50} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-2 self-center mt-2">
                                            {formatLicense(island.license).map((license, i) => <CcIcons key={i} ty={license} inv className="w-4 aspect-square" />)}
                                        </div>
                                        <div className="flex flex-col gap-1 self-end mb-1 mr-1">
                                            <RectDot inv size={6} cnt={4} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    {
                        island.ty != "achievement" &&
                        <div className="flex flex-col -mt-2">
                            <AsciiText className="self-end text-[8pt] opacity-50 italic">Permission Authorized</AsciiText>
                            <EndDecoLine deco={<RectDot size={3} />} decoSize={3} decoGap={4} lineThickness={1} lineStyle="dashed" />
                        </div>
                    }
                    <div className="flex justify-between gap-2 items-end">
                        <div className="flex gap-2">
                            <div className="flex gap-x-4 gap-y-2 flex-wrap">
                                {
                                    island.tags.map((tag, i) => <Tag key={i} tag={tag} highlightIfActivate />)
                                }
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="w-1 bg-dark-0 dark:bg-light-0" style={{ height: "calc(50% - 2px)" }} />
                                <div className="w-1 bg-dark-0 dark:bg-light-0" style={{ height: "calc(50% - 2px)" }} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-dark-0 dark:bg-light-0 px-2">
                                <AsciiText className="font-bold text-center" inv>{formatState(island.ty, island.state)}</AsciiText>
                            </div>
                            <div className="bg-accent-0 px-2">
                                <AsciiText className="text-center" inv>{formatDate(island.date ?? undefined)}</AsciiText>
                            </div>
                            <FocusRect className="h-6 aspect-square self-end mb-[1px]" />
                        </div>
                    </div>
                </div>
            </CornerDecoBox>
        </AnimEnterBlink>
    )
}
