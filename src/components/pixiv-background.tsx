"use client"

import { wrappedFetch } from "@/data/api"
import { frontendEndpoint } from "@/data/endpoints"
import { ArtworkMeta } from "@/data/model"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Text from "./text"
import LinkNoPrefetch from "./link-no-prefetch"
import OutlinedBox from "./outlined-box"
import { IoCloseOutline } from "react-icons/io5"
import OutlinedButton from "./outlined-button"

const disabled = ["/map"]

export default function PixivBackground() {
    const [meta, setMeta] = useState<ArtworkMeta | undefined>()
    const [apologizeOverlay, setApologizeOverlay] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        async function fetch() {
            const resp = await wrappedFetch<ArtworkMeta>(frontendEndpoint("/pixiv-weekly.json"), "GET")
            if (resp.ok) {
                setMeta(resp.data)
            }
        }

        fetch()
    }, [])

    if (disabled.some((key => pathname.includes(key)))) {
        return <></>
    }

    const BackgroundWrapper = ({ ext }: { ext: string }) =>
        <div
            className="w-[100vw] h-[100vh] fixed -z-[1000] bg-cover bg-fixed opacity-20 blur-md"
            style={{
                backgroundImage: `url(${frontendEndpoint(`/images/pixiv-weekly.${ext}`)})`,
                // Avoid blur issue on edge of image
                scale: "1.05",
            }}
        />

    return (
        <>
            {
                apologizeOverlay &&
                <div className="fixed w-[100vw] h-[100vh] z-[10000000] flex items-center justify-center bg-black bg-opacity-50">
                    <OutlinedBox className="flex flex-col gap-2 bg-light-background dark:bg-dark-background w-2/3 h-2/3 p-4 text-2xl">
                        <OutlinedButton
                            className="w-8 h-8 self-end"
                            onClick={() => setApologizeOverlay(false)}
                        >
                            <IoCloseOutline />
                        </OutlinedButton>
                        <div className="flex flex-col">
                            <Text>如果背景是你的作品，并且你不希望我使用他作为背景，请发送邮件至 443eb9@gmail.com 或 3166943013@qq.com ，我会尽快删除并且以后不再使用你的作品</Text>
                            <Text className="text-right">非常抱歉！o(TヘTo)</Text>
                        </div>
                    </OutlinedBox>
                </div>
            }
            <BackgroundWrapper ext="jpg" />
            <BackgroundWrapper ext="png" />
            {
                meta &&
                <div className="fixed right-0 bottom-0 z-10 flex flex-col">
                    <LinkNoPrefetch
                        href={meta.src}
                        target="_blank"
                        className="flex flex-col md:flex-row gap-0 md:gap-2 italic text-right opacity-50"
                        style={{
                            fontSize: "10px",
                        }}
                    >
                        <Text elem="span">{meta.name}</Text>
                        <Text elem="span">By {meta.author}</Text>
                    </LinkNoPrefetch>
                    <button>
                        <Text className="opacity-50 underline text-xs text-right" onClick={() => setApologizeOverlay(true)}>
                            我不希望我的作品出现在这里
                        </Text>
                    </button>
                </div>
            }
        </>
    )
}
