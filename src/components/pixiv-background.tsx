"use client"

import { wrappedFetch } from "@/data/api"
import { frontendEndpoint } from "@/data/endpoints"
import { ArtworkMeta } from "@/data/model"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Text from "./text"
import LinkNoPrefetch from "./link-no-prefetch"

const disabled = ["/map"]

export default function PixivBackground() {
    const [meta, setMeta] = useState<ArtworkMeta | undefined>()
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

    return (
        <>
            <div
                className="w-[100vw] h-[100vh] fixed -z-[1000] bg-cover bg-fixed bg-center opacity-20 blur-md"
                style={{
                    backgroundImage: `url(${frontendEndpoint(`/images/pixiv-weekly.webp`)})`,
                    // Avoid blur issue on edge of image
                    scale: "1.05",
                }}
            />
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
                </div>
            }
        </>
    )
}
