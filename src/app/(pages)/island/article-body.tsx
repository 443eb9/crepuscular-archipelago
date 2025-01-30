"use client"

import OutlinedBox from "@/components/outlined-box"
import Markdown from "@/components/markdown"
import { IslandMeta } from "@/data/model"
import { useEffect, useState } from "react"
import { decrypt } from "@/data/utils"

export default function ArticleBody({ island, body }: { island: IslandMeta, body: string }) {
    const [content, setContent] = useState(body)

    useEffect(() => {
        if (!island.isEncrypted) { return }

        const key = localStorage.getItem("islandKey") ?? undefined
        const iv = localStorage.getItem("islandIv") ?? undefined

        if (key && iv) {
            try {
                setContent(decrypt(body, key, iv))
            } catch (err) {
                // pass
            }
        }
    }, [content])

    return (
        <div className="flex flex-col gap-5 w-full">
            <OutlinedBox className="px-5 py-8">
                <Markdown body={content} />
            </OutlinedBox>
        </div>
    )
}
