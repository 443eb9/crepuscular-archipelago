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

    // const handleKeyChange = () => {
    //     if (!cipher) { return }

    //     const input = document.querySelector("#cipher-key-input") as HTMLInputElement
    //     localStorage.setItem("islandKey", input.value)
    //     setCipher({ ...cipher, key: input.value })
    // }

    // const handleIvChange = () => {
    //     if (!cipher) { return }

    //     const input = document.querySelector("#cipher-iv-input") as HTMLInputElement
    //     localStorage.setItem("islandIv", input.value)
    //     setCipher({ ...cipher, iv: input.value })
    // }

    // const InputField = ({ title, id, submit }: { title: string, id: string, submit: () => void }) => {
    //     return (
    //         <div className="flex flex-col md:flex-row items-center justify-between gap-2">
    //             <Text>{title}</Text>
    //             <div className="flex flex-grow w-full md:w-auto gap-2">
    //                 <Input
    //                     id={id}
    //                     className="md:flex-grow"
    //                     onEnterDown={submit}
    //                     style={{ width: "calc(100% - 40px)" }}
    //                 />
    //                 <OutlinedButton
    //                     className="w-8 h-8"
    //                     onClick={submit}
    //                 >
    //                     <IoCheckmarkSharp className="text-2xl" />
    //                 </OutlinedButton>
    //             </div>
    //         </div>
    //     )
    // }

    // const EncryptionHandler = () => <OutlinedBox className="p-4 flex flex-col gap-2">
    //     <Text>该文章被加密，你需要持有正确的密钥才可解析出正确内容</Text>
    //     <div className="flex flex-col md:flex-row justify-around">
    //         <Text className="break-words">{cipher?.key ? `本地保存的密钥为：${cipher.key}` : "本地未保存任何密钥"}</Text>
    //         <Text className="break-words">{cipher?.iv ? `本地保存的初始向量为：${cipher.iv}` : "本地未保存任何初始向量"}</Text>
    //     </div>
    //     <div className="flex flex-col gap-2">
    //         <InputField title="（新）密钥" id="cipher-key-input" submit={handleKeyChange} />
    //         <InputField title="（新）初始向量" id="cipher-iv-input" submit={handleKeyChange} />
    //     </div>
    //     {
    //         decryptErr &&
    //         <Text>解密时发生错误：{decryptErr}</Text>
    //     }
    // </OutlinedBox>

    return (
        <div className="flex flex-col gap-5 w-full">
            {/* {island.isEncrypted && <EncryptionHandler />} */}
            <OutlinedBox className="px-5 py-8">
                <Markdown body={content} />
            </OutlinedBox>
        </div>
    )
}
