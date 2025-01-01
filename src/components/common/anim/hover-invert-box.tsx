'use client'

import { ReactNode } from "react"
import { MotionDiv } from "../framer-motion-reexport/motion-div"
import { useAnimation } from "framer-motion"

export default function HoverInvertBox({ children, from }: { children: ReactNode, from: "top" | "left" }
) {
    const control = useAnimation()
    const initialWidth = from == "left" ? 0 : 100
    const initialHeight = from == "top" ? 0 : 100

    return (
        <div className="relative w-full h-full">
            <MotionDiv
                animate={control}
                className="absolute invert text-nowrap flex-nowrap overflow-clip pointer-events-none"
                transition={{ duration: 0.3, ease: [0.42, 0, 0.58, 1] }}
                style={{
                    width: asPercent(initialWidth),
                    height: asPercent(initialHeight),
                }}
            >
                {children}
            </MotionDiv>
            <div
                className="w-full h-full"
                onMouseEnter={() => control.start({
                    width: asPercent(100),
                    height: asPercent(100),
                })}
                onMouseLeave={() => control.start({
                    width: asPercent(initialWidth),
                    height: asPercent(initialHeight),
                })}
            >
                {children}
            </div>
        </div>
    )
}

function asPercent(x: number) {
    return `${x}%`
}
