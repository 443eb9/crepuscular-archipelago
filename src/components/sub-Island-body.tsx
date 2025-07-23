'use client'

import { SubIsland } from "@/data/model";
import { decrypt } from "@/data/utils";
import { useEffect, useState } from "react";
import OutlinedBox from "./outlined-box";
import Markdown from "./markdown";
import Text from "./text";
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";

export default function SubIslandBody({ subIsland }: { subIsland: SubIsland }) {
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
                        <Text className="font-bender" noFont>Encrypted Content</Text>
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
                        <Text className="font-bender" noFont>Encrypted Content</Text>
                    </div>
                    <Markdown body={subIsland.content} />
                </div>
            </OutlinedBox>
        )
    }
}
