"use client"

import { useRouter } from "next/navigation"
import ContentWrapper from "@/components/content-wrapper"
import OutlinedButton from "@/components/outlined-button"
import NavBar from "@/components/nav-bar"
import AsciiText from "@/components/text/ascii-text"

export default function NotFound() {
    const router = useRouter()

    return (
        <main>
            <NavBar />
            <div className="flex-1 h-20"></div>
            <ContentWrapper className="flex flex-col">
                <AsciiText className="font-bold text-5xl">Fatal: Undefined Coordinate</AsciiText>
                <div className="font-neon">
                    <AsciiText>Terminal Output:</AsciiText>
                    {/* Time here can be different from the server. So suppressHydrationWarning.*/}
                    <AsciiText suppressHydrationWarning>&gt; [INFO][{new Date().toISOString()}][Engine] Start warping to island {Math.floor(Math.random() * 10000000)}.</AsciiText>
                    <AsciiText suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Engine] Undefined island coordinate.</AsciiText>
                    <AsciiText suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Renderer] Failed to render the scene.</AsciiText>
                </div>
                <OutlinedButton className="mt-3 w-24 h-10 flex justify-center items-center" onClick={router.back}>
                    <AsciiText>Back</AsciiText>
                </OutlinedButton>
            </ContentWrapper>
        </main>
    )
}
