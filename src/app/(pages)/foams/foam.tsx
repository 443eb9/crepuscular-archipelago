"use client"

import Markdown from "@/components/markdown";
import OutlinedBox from "@/components/outlined-box";
import Text from "@/components/text";
import { FoamData } from "@/data/model";
import { decrypt } from "@/data/utils";
import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa6";
import { TbClockQuestion } from "react-icons/tb";

export default function Foam({ foam }: { foam: FoamData }) {
    const [content, setContent] = useState(foam.content)

    useEffect(() => {
        if (!foam.is_encrypted) { return }

        const key = localStorage.getItem("islandKey") ?? undefined
        const iv = localStorage.getItem("islandIv") ?? undefined
        if (key && iv) {
            try {
                setContent(decrypt(foam.content, key, iv))
            } catch {
                // pass
            }
        }
    }, [])

    return (
        <OutlinedBox className="p-2">
            <Markdown body={content} />
            <div className="flex items-center gap-1 justify-end">
                {
                    foam.date == undefined
                        ?
                        <>
                            <TbClockQuestion className="text-lg" />
                            <div className="font-bender">Future</div>
                        </>
                        : <>
                            <FaClock />
                            <Text className="font-bender" suppressHydrationWarning>
                                {(new Date(foam.date)).toLocaleDateString()}
                            </Text>
                        </>
                }
            </div>
        </OutlinedBox>
    )
}
