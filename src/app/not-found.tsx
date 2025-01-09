'use client'

import { useRouter } from "next/navigation"
import GlobalNavBar from "./(pages)/global-nav-bar"
import ContentWrapper from "@/components/content-wrapper"
import OutlinedButton from "@/components/outlined-button"

export default function NotFound() {
    const router = useRouter()

    return (
        <main>
            <GlobalNavBar />
            <div className="flex-1 h-20"></div>
            <ContentWrapper className="flex flex-col">
                <div className="font-bender font-bold text-5xl">Fatal: Undefined Coordinate</div>
                <div className="font-neon">
                    <div>Terminal Output:</div>
                    {/* Time here can be different from the server. So suppressHydrationWarning.*/}
                    <div suppressHydrationWarning>&gt; [INFO][{new Date().toISOString()}][Teleporter] Start teleporting to island {Math.floor(Math.random() * 10000000)}.</div>
                    <div suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Teleporter] Undefined island coordinate.</div>
                    <div suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Renderer] Failed to render the scene.</div>
                </div>
                <OutlinedButton className="font-bender mt-3 w-24 h-10" onClick={router.back}>Back</OutlinedButton>
            </ContentWrapper>
        </main>
    )
}
