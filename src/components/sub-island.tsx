"use client"

import { decrypt } from "@/data/utils";
import { useEffect, useRef, useState } from "react";
import OutlinedBox from "./outlined-box";
import Markdown from "./markdown";
import { IoCheckmarkSharp, IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";
import { SubIslandData } from "@/data/model";
import AsciiText from "./text/ascii-text";
import OutlinedButton from "./outlined-button";
import BodyText from "./text/body-text";
import Input from "./input";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

export default function SubIsland({ subIsland }: { subIsland: SubIslandData }) {
    const [decrypted, setDecrypted] = useState<string | undefined>()
    const [expandKeyPanel, setExpandKeyPanel] = useState(false)
    const keyRef = useRef<HTMLInputElement>(null)
    const ivRef = useRef<HTMLInputElement>(null)

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

    const handleKeySubmit = () => {
        if (!keyRef.current || !ivRef.current) return

        localStorage.setItem("islandKey", keyRef.current.value)
        localStorage.setItem("islandIv", ivRef.current.value)
        setExpandKeyPanel(false)
        try {
            setDecrypted(decrypt(subIsland.content, keyRef.current.value, ivRef.current.value))
        } catch (err) {
            // pass
        }
    }

    if (decrypted) {
        return (
            <OutlinedBox className="border-dashed p-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <IoLockOpenOutline className="text-dark-0 dark:text-light-0" />
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
                        <IoLockClosedOutline className="text-dark-0 dark:text-light-0" />
                        <AsciiText>Encrypted Content</AsciiText>
                    </div>
                    <Markdown body={subIsland.content} />
                    {
                        !decrypted &&
                        <div className="relative">
                            <OutlinedButton className="w-16 h-8 flex items-center justify-center" onClick={() => setExpandKeyPanel(!expandKeyPanel)}>
                                <BodyText>解密</BodyText>
                            </OutlinedButton>
                            <AnimatePresence>
                                {
                                    expandKeyPanel &&
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        exit={{ scaleY: 0 }}
                                    >
                                        <OutlinedBox className="absolute flex flex-col gap-2 backdrop-blur-md p-2">
                                            <div className="flex gap-4 items-baseline">
                                                <BodyText>密钥</BodyText>
                                                <Input className="flex flex-grow" ref={keyRef} />
                                            </div>
                                            <div className="flex gap-4 items-baseline">
                                                <BodyText>初始向量</BodyText>
                                                <Input className="flex flex-grow" ref={ivRef} />
                                            </div>
                                            <OutlinedButton className="absolute h-8 flex justify-center items-center" onClick={handleKeySubmit}>
                                                <IoCheckmarkSharp className="text-2xl text-dark-0 dark:text-light-0" />
                                                <BodyText >确认</BodyText>
                                            </OutlinedButton>
                                        </OutlinedBox>
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </div>
                    }
                </div>
            </OutlinedBox>
        )
    }
}
