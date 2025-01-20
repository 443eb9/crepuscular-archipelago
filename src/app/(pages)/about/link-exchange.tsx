"use client"

import EmphasizedBox from "@/components/decos/emphasized-box"
import Text from "@/components/text"
import { LinkExchangeData } from "@/data/model"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import FriendDialog from "./friend-dialog"

const SuppressBlur = "suppress-blur"

export default function LinkExchange({ links }: { links: LinkExchangeData[] }) {
    const [curDialog, setCurDialog] = useState<number | undefined>()

    useEffect(() => {
        const blurHandler = (ev: MouseEvent) => {
            let target = ev.target as HTMLElement
            while (!target.classList.contains(SuppressBlur)) {
                if (target.parentElement == null) {
                    setCurDialog(undefined)
                    break
                } else {
                    target = target.parentElement
                }
            }
        }

        document.addEventListener("mousedown", blurHandler)
        return () => {
            document.removeEventListener("mousedown", blurHandler)
        }
    }, [curDialog])

    return (
        <div className="w-full mt-4 grid-cols-1 grid md:grid-cols-2 gap-5">
            {
                links.map((link, i) => {
                    return (
                        <div key={i} className="relative border-b-2 border-dark-contrast">
                            <div className="flex justify-between h-full items-center">
                                <div className="flex flex-grow h-full gap-5 items-center p-3">
                                    <div className="relative">
                                        <EmphasizedBox
                                            className={`relative w-12 h-12 p-1 ${SuppressBlur}`}
                                            thickness={3}
                                            length={10}
                                            onClick={() => setCurDialog(i)}
                                        >
                                            <Image src={link.avatar} alt={`${link.name} avatar`} fill unoptimized />
                                        </EmphasizedBox>
                                        {
                                            curDialog == i && link.dialog &&
                                            <div className={`absolute w-96 z-10 ${SuppressBlur}`}>
                                                <FriendDialog dialog={link.dialog} />
                                            </div>
                                        }
                                    </div>
                                    <Link target="_blank" href={link.link} className="flex flex-col h-full" style={{ maxWidth: "calc(100% - 80px)" }}>
                                        <Text className="text-small">{link.name}</Text>
                                        <Text className="text-light-dark-neutral text-small">{link.message}</Text>
                                    </Link>
                                </div>
                                <Text className="mr-4 italic font-bold text-4xl font-bender text-light-dark-neutral" noFont>
                                    #{i}
                                </Text>
                            </div>
                            <div className="absolute flex items-center overflow-clip w-full h-[2px]">
                                <div className="relative w-full aspect-square scale-y-[30%]">
                                    <Image className="scale-150 blur-3xl" src={link.avatar} alt={`${link.name} background`} fill unoptimized />
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}
