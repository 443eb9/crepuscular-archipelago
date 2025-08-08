"use client"

import { decrypt } from "@/data/utils";
import { useEffect, useState } from "react";
import OutlinedBox from "./outlined-box";
import Markdown from "./markdown";
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";
import { SubIslandData } from "@/data/model";
import AsciiText from "./text/ascii-text";

export default function SubIsland({ subIsland }: { subIsland: SubIslandData }) {
    const [decrypted, setDecrypted] = useState<string | undefined>()

    useEffect(() => {
        if (!subIsland.isEncrypted) { return; }

        const key = localStorage.getItem("islandKey") ?? undefined
        const iv = localStorage.getItem("islandIv") ?? undefined

        if (key && iv) {
            try {
                setDecrypted(decrypt(subIsland.content, key, iv))
            } catch (err) {
                // pass
            }
        }
    }, [])

    if (decrypted) {
        return (
            <OutlinedBox className="border-dashed p-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <IoLockOpenOutline />
                        <AsciiText>Encrypted Content</AsciiText>
                    </div>
                    <Markdown body={decrypted} />
                </div>
            </OutlinedBox>
        )
    } else if (!subIsland.isEncrypted) {
        return <Markdown body={subIsland.content} />
    } else {
        return (
            <OutlinedBox className="border-dashed p-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <IoLockClosedOutline />
                        <AsciiText>Encrypted Content</AsciiText>
                    </div>
                    <Markdown body={subIsland.content} />
                </div>
            </OutlinedBox>
        )
    }
}
