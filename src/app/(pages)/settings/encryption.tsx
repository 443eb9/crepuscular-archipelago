"use client"

import Input from "@/components/input"
import OutlinedBox from "@/components/outlined-box"
import OutlinedButton from "@/components/outlined-button"
import Text from "@/components/text"
import { useEffect, useState } from "react"
import { IoCheckmarkSharp } from "react-icons/io5"

export default function Encryption() {
    const [cipher, setCipher] = useState<{ key?: string, iv?: string } | undefined>()

    useEffect(() => {
        setCipher({
            key: localStorage.getItem("islandKey") ?? undefined,
            iv: localStorage.getItem("islandIv") ?? undefined,
        })
    }, [])

    const handleKeyChange = () => {
        const input = document.querySelector("#cipher-key-input") as HTMLInputElement
        localStorage.setItem("islandKey", input.value)
        setCipher({ ...cipher, key: input.value })
    }

    const handleIvChange = () => {
        const input = document.querySelector("#cipher-iv-input") as HTMLInputElement
        localStorage.setItem("islandIv", input.value)
        setCipher({ ...cipher, iv: input.value })
    }

    const InputField = ({ title, id, submit }: { title: string, id: string, submit: () => void }) => {
        return (
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <Text>{title}</Text>
                <div className="flex flex-grow w-full md:w-auto gap-2">
                    <Input
                        id={id}
                        className="md:flex-grow"
                        onEnterDown={submit}
                        style={{ width: "calc(100% - 40px)" }}
                    />
                    <OutlinedButton
                        className="w-8 h-8"
                        onClick={submit}
                    >
                        <IoCheckmarkSharp className="text-2xl" />
                    </OutlinedButton>
                </div>
            </div>
        )
    }

    return (
        <OutlinedBox className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <Text>在晨暮群岛中，有些内容是被加密的。如果你没有密钥或者密钥错误导致的解密失败，这些加密内容则会直接以密文的形式呈现。</Text>
                <Text>你可以在下方填入密钥和初始向量，这样在每次遇到加密内容时，则会自动解密。</Text>
            </div>
            <div className="flex flex-col md:flex-row justify-around">
                <Text className="break-words">{cipher?.key ? `本地保存的密钥为：${cipher.key}` : "本地未保存任何密钥"}</Text>
                <Text className="break-words">{cipher?.iv ? `本地保存的初始向量为：${cipher.iv}` : "本地未保存任何初始向量"}</Text>
            </div>
            <div className="flex flex-col gap-2">
                <InputField title="（新）密钥" id="cipher-key-input" submit={handleKeyChange} />
                <InputField title="（新）初始向量" id="cipher-iv-input" submit={handleIvChange} />
            </div>
        </OutlinedBox>
    )
}
