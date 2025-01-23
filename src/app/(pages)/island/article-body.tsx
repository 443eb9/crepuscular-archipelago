"use client"

import OutlinedBox from "@/components/outlined-box"
import Markdown from "@/components/markdown"
import { IslandMeta } from "@/data/model"
import Text from "@/components/text"
import Input from "@/components/input"
import OutlinedButton from "@/components/outlined-button"
import { IoCheckmarkSharp } from "react-icons/io5"
import { useEffect, useState } from "react"
import { createDecipheriv } from "crypto"

export default function ArticleBody({ island, body }: { island: IslandMeta, body: string }) {
    const [cipher, setCipher] = useState<{ key?: string, iv?: string } | undefined>()
    const [decryptErr, setDecryptErr] = useState<string | undefined>()
    const [content, setContent] = useState(body)

    useEffect(() => {
        if (!island.isEncrypted) { return }

        const key = localStorage.getItem("islandKey") ?? undefined
        const iv = localStorage.getItem("islandIv") ?? undefined
        setCipher({ key, iv })
    }, [])

    useEffect(() => {
        if (cipher?.key && cipher.iv) {
            try {
                const key = Buffer.from(cipher.key)
                const nonce = Buffer.from(cipher.iv)
                const content = Buffer.from(body, "base64")
                const data = content.subarray(0, content.length - 16)
                const authTag = content.subarray(content.length - 16)

                const decipher = createDecipheriv("aes-256-gcm", key, nonce)
                decipher.setAuthTag(authTag)
                const decrypted = decipher.update(data, undefined, "utf8") + decipher.final("utf8")

                setContent(decrypted.toString())
                setDecryptErr(undefined)
            } catch (err) {
                setDecryptErr((err as Error).toString())
                setContent(body)
            }
        } else {
            setContent(body)
        }
    }, [content, cipher])

    const handleKeyChange = () => {
        if (!cipher) { return }

        const input = document.querySelector("#cipher-key-input") as HTMLInputElement
        localStorage.setItem("islandKey", input.value)
        setCipher({ ...cipher, key: input.value })
    }

    const handleIvChange = () => {
        if (!cipher) { return }

        const input = document.querySelector("#cipher-iv-input") as HTMLInputElement
        localStorage.setItem("islandIv", input.value)
        setCipher({ ...cipher, iv: input.value })
    }

    const EncryptionHandler = () => <OutlinedBox className="p-4 flex flex-col gap-2">
        <Text>该文章被加密，你需要持有正确的密钥才可解析出正确内容</Text>
        <div className="flex justify-around">
            <Text>{cipher?.key ? `本地保存的密钥为：${cipher.key}` : "本地未保存任何密钥"}</Text>
            <Text>{cipher?.iv ? `本地保存的初始向量为：${cipher.iv}` : "本地未保存任何初始向量"}</Text>
        </div>
        <div className="flex items-center justify-between gap-2">
            <Text>（新）密钥</Text>
            <Input
                id="cipher-key-input"
                className="flex flex-grow"
                onEnterDown={handleKeyChange}
            />
            <OutlinedButton
                className="w-8 h-8"
                onClick={handleKeyChange}
            >
                <IoCheckmarkSharp className="text-2xl" />
            </OutlinedButton>
        </div>
        <div className="flex items-center justify-between gap-2">
            <Text>（新）初始向量</Text>
            <Input
                id="cipher-iv-input"
                className="flex flex-grow"
                onEnterDown={handleIvChange}
            />
            <OutlinedButton
                className="w-8 h-8"
                onClick={handleIvChange}
            >
                <IoCheckmarkSharp className="text-2xl" />
            </OutlinedButton>
        </div>
        {
            cipher?.key && cipher.iv &&
            <Text>已使用本地保存的密钥与初始向量对文章进行解密，如果没有报错并且出现正常的内容，则说明密钥与初始向量正确，解密成功</Text>
        }
        {
            decryptErr &&
            <Text>解密时发生错误：{decryptErr}</Text>
        }
    </OutlinedBox>

    return (
        <div className="flex flex-col gap-5 w-full">
            {island.isEncrypted && <EncryptionHandler />}
            <OutlinedBox className="px-5 py-8">
                <Markdown body={content} />
            </OutlinedBox>
        </div>
    )
}
