"use client"

import AsciiText from "@/components/text/ascii-text";
import { SelfTitleData } from "@/data/model";
import { useTheme } from "next-themes";
import { useState } from "react";
import Typist from "react-typist-component";

export default function MotionTitles({ titles }: { titles: SelfTitleData[] }) {
    const { resolvedTheme } = useTheme()
    const [index, setIndex] = useState(0)
    const cur = titles[index]
    const percentage = `${cur.progress * 100} Percent`

    return (
        <Typist
            key={index}
            onTypingDone={() => {
                setIndex((index + 1) % titles.length)
            }}
            cursor={
                <div className="bottom-0 bg-dark-0 dark:bg-light-0 w-[0.5em] h-2 mt-[1em] inline-block ml-1" />
            }
        >
            {
                cur.progress < 1 &&
                <AsciiText>{percentage}</AsciiText>
            }
            <AsciiText
                style={cur.progress < 1 ? {
                    color: "transparent",
                    WebkitTextStrokeWidth: "1px",
                    WebkitTextStrokeColor: resolvedTheme == "light" ? "#f5f5f5" : "#171717"
                } : undefined}
            >
                {cur.title}
            </AsciiText>
            <Typist.Delay ms={1000} />
            <Typist.Backspace count={cur.progress == 1 ? cur.title.length : percentage.length + cur.title.length} />
        </Typist>
    )
}
