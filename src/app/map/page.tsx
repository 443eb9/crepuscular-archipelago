"use client"

import AsciiText from "@/components/text/ascii-text";
import TitleText from "@/components/text/title-text";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const [countDown, setCountDown] = useState(5)
    const router = useRouter()

    useEffect(() => {
        setTimeout(() => setCountDown(countDown - 1), 1000)
        if (countDown === 0) {
            router.back()
        }
    }, [countDown])

    return (
        <div className="w-[100vw] h-[100vh] flex justify-center items-center">
            <div className="flex flex-col">
                <TitleText className="text-2xl">正在重构...</TitleText>
                <AsciiText>Refactoring...</AsciiText>
                <TitleText className="text-lg">{countDown} 秒后返回上一页</TitleText>
            </div>
        </div>
    )
}
