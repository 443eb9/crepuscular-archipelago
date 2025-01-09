"use client"

import Giscus from "@giscus/react"
import { useTheme } from "next-themes"

export default function GiscusSection({ className }: { className?: string }) {
    const theme = useTheme().resolvedTheme ?? "light"

    return (
        <div className={className}>
            <Giscus
                repo="443eb9/crepuscular-archipelago"
                repoId="R_kgDOLyot2Q"
                category="Giscus"
                categoryId="DIC_kwDOLyot2c4Cf7i_"
                mapping="title"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme={theme == "light" ? "light" : "transparent_dark"}
                lang={"en"}>
            </Giscus>
        </div>
    )
}
