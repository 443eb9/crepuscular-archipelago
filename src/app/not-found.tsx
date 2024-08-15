'use client'

import ContentWrapper from "@/components/common/content-wrapper";
import OutlinedButton from "@/components/common/interact/outlined-button";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-20"></div>
            <ContentWrapper className="flex flex-col">
                <div className="font-bender font-bold text-5xl">Fatal: Undefined Coordinate</div>
                <div className="font-argon">
                    <div>Terminal Output:</div>
                    {/* Time here can be different from the server. So suppressHydrationWarning.*/}
                    <div suppressHydrationWarning>&gt; [INFO][{new Date().toISOString()}][Teleporter] Start teleporting to island {Math.floor(Math.random() * 10000000)}.</div>
                    <div suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Teleporter] Undefined island coordinate.</div>
                    <div suppressHydrationWarning>&gt; [FATAL][{new Date().toISOString()}][Renderer] Failed to render the scene.</div>
                </div>
                <OutlinedButton className="font-bender mt-3 w-24 h-10" onClick={router.back}>Back</OutlinedButton>
            </ContentWrapper>
        </main>
    );
}
