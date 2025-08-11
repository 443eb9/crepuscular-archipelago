"use client"

import AsciiText from "@/components/text/ascii-text";
import TitleText from "@/components/text/title-text";
import { LinkExchangeData } from "@/data/model";
import { AnimatePresence } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import * as motion from "motion/react-client";
import OutlinedBox from "@/components/outlined-box";
import BodyText from "@/components/text/body-text";
import CornerDecoBox from "@/components/corner-deco-box";
import RectDot from "@/components/rect-dot";
import Link from "next/link";
import DiagLines from "@/components/svg-deco/diag-lines";
import OutlinedButton from "@/components/outlined-button";
import { useRouter } from "next/navigation";

export default function FriendsClientPageWrapper({ linkExchange }: { linkExchange: LinkExchangeData[] }) {
    const [select, setSelect] = useState(0)

    useEffect(() => {
        const scrollHandler = (ev: WheelEvent) => {
            if (window.scrollY > 0) return

            const offset = ev.deltaY > 0 ? 1 : -1
            const newSelect = select + offset
            if (newSelect >= 0 && newSelect < linkExchange.length) {
                setSelect(newSelect)
            }
        }

        window.addEventListener("wheel", scrollHandler)
        return () => {
            window.removeEventListener("wheel", scrollHandler)
        }
    }, [select])

    const selectedLink = linkExchange[select]
    const router = useRouter()

    return (
        <div className="relative w-[100vw] h-[100vh]">
            <AnimatePresence>
                {
                    selectedLink.background &&
                    <motion.img
                        initial={{ opacity: 0, filter: "blur(40px)" }}
                        animate={{ opacity: 0.5, filter: "blur(2px)", transition: { duration: 0.2, ease: "easeOut" } }}
                        exit={{ opacity: 0, filter: "blur(40px)", transition: { duration: 0.2, ease: "easeOut" } }}
                        src={selectedLink.background}
                        className="absolute w-[100vw] h-[100vh] object-cover -z-10"
                    />
                }
            </AnimatePresence>
            <div className="absolute bottom-0 right-0 m-2">
                <Link href="https://www.travellings.cn/go.html" target="_blank">
                    <Image
                        src="https://www.travellings.cn/assets/logo.gif"
                        alt="开往"
                        width={100}
                        height={100}
                    />
                </Link>
            </div>
            <div className="absolute flex gap-2 m-2">
                <OutlinedButton className="w-16 flex justify-center items-center" onClick={() => router.back()}>
                    <AsciiText>Back</AsciiText>
                </OutlinedButton>
                {linkExchange.map((link, i) =>
                    <div key={i} className="relative flex flex-col gap-1 cursor-pointer" onClick={() => setSelect(i)}>
                        <div className="relative w-12 h-12">
                            <Image src={link.avatar} alt={`${link.name} avatar`} fill unoptimized />
                        </div>
                        <AnimatePresence>
                            {
                                i == select &&
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%", transition: { duration: 0.2, ease: "easeOut" } }}
                                    exit={{ width: "0%", transition: { duration: 0.2, ease: "easeOut" } }}
                                    className="flex items-center overflow-clip h-1"
                                >
                                    <div className="relative w-full aspect-square scale-y-[30%] blur-sm">
                                        <Image src={link.avatar} alt={`${link.name} avatar`} fill unoptimized />
                                    </div>
                                </motion.div>
                            }
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <div className="flex justify-center items-center w-full h-full">
                <AnimatePresence>
                    <LargeView link={selectedLink} />
                </AnimatePresence>
            </div>
        </div>
    )
}

function LargeView({ link }: { link: LinkExchangeData }) {
    return (
        <motion.div
            key={link.name}
            className="flex justify-center items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
        >
            <CornerDecoBox
                tl={{ node: <RectDot size={10} />, lineStyle: "none" }}
                tr={{ lineStyle: "none" }}
                br={{ lineStyle: "none" }}
                bl={{ node: <RectDot size={10} />, lineStyle: "dashed" }}
                lineThickness={1}
                decoSize={10}
                decoGap={10}
                className="flex gap-2 items-center w-[540px] py-2"
            >
                <div className="relative w-24 h-24 m-4">
                    <Image src={link.avatar} alt={`${link.name} avatar`} fill unoptimized />
                    <div className="absolute bg-accent-0 w-2 aspect-square -right-4" />
                </div>
                <div className="flex flex-col justify-between">
                    <div className="">
                        <div className="">
                            <TitleText className="text-xl">{link.name}</TitleText>
                        </div>
                        <div className="">
                            <BodyText>{link.message}</BodyText>
                        </div>
                    </div>
                    <AsciiText className="italic opacity-50">
                        <Link target="_blank" href={link.link}>{link.link}</Link>
                    </AsciiText>
                </div>
            </CornerDecoBox>
            <DiagLines className="w-14 h-14 aspect-square" style={{ maskSize: "200%", WebkitMaskSize: "200%" }} />
        </motion.div>
    )
}
