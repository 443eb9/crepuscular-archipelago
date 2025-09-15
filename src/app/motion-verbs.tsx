"use client"

import AsciiText from "@/components/text/ascii-text";
import { useState } from "react";
import Typist from "react-typist-component";

const verbs = ["Paint", "Code", "Create", "Build", "Contribute", "Sketch", "Dream", "Draw", "Imagine", "Experience"]

export default function MotionVerbs() {
    const [index, setIndex] = useState(0)
    const cur = verbs[index]

    return (
        <div className="flex">
            <AsciiText>I&nbsp;</AsciiText>
            <Typist
                key={index}
                onTypingDone={() => {
                    setIndex((index + 1) % verbs.length)
                }}
                cursor={
                    <div className="bg-dark-0 dark:bg-light-0 w-[0.5em] h-1 mt-[1em] inline-block ml-1 -mb-1" />
                }
            >
                <AsciiText> {cur}</AsciiText>
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={cur.length} />
            </Typist>
        </div>
    )
}
