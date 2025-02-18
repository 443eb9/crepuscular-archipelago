"use client"

import { HTMLMotionProps, motion } from "motion/react";
import { ReactNode, useRef, useState } from "react";

export default function AnimHoverInvertBox(props: HTMLMotionProps<"div">) {
    const parent = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)

    return (
        <div className="relative">
            <motion.div
                {...props}
                children={undefined}
                className={`absolute pointer-events-none h-full backdrop-invert ${props.className}`}
                animate={{
                    width: progress
                }}
            >
            </motion.div>
            <div className="w-full h-full" ref={parent} onMouseEnter={() => setProgress(parent.current?.clientWidth ?? 0)} onMouseLeave={() => setProgress(0)}>
                {props.children as ReactNode}
            </div>
        </div>
    )
}
