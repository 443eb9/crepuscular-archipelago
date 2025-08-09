"use client"

import { HTMLMotionProps, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import * as motion from "motion/react-client";
import { lerp } from "@/data/utils";

export default function AnimEnterBlink({
    durationRange, blinkCountRange, opacityRange, suppress, ...props
}: {
    durationRange?: [number, number], blinkCountRange?: [number, number], opacityRange?: [number, number], suppress?: boolean
} & HTMLMotionProps<"div">) {
    const _durationRange = durationRange ?? [5, 30]
    const _blinkCountRange = blinkCountRange ?? [2, 4]
    const _opacityRange = opacityRange ?? [0.2, 0.8]

    const opacity = useMotionValue(suppress ? 1 : 0)
    const thisRef = useRef<HTMLDivElement>(null)
    const animTriggered = useRef(false)

    const animator = async () => {
        const t = Math.round(lerp(_blinkCountRange[0], _blinkCountRange[1], Math.random()))
        for (let i = 0; i < t; i++) {
            opacity.set(lerp(_opacityRange[0], _opacityRange[1], Math.random()))
            await new Promise(resolve => setTimeout(resolve, lerp(_durationRange[0], _durationRange[1], Math.random())))
        }
        opacity.set(1)
    }

    const enterHandler = () => {
        if (!thisRef.current) return
        const bounding = thisRef.current.getBoundingClientRect()
        if (bounding.bottom > 0 && bounding.top < document.documentElement.clientHeight && !animTriggered.current) {
            animTriggered.current = true
            animator()
        }
    }

    useEffect(() => {
        if (suppress) return
        opacity.set(0)
        animTriggered.current = false
        enterHandler()
    })

    useEffect(() => {
        if (suppress) return
        document.addEventListener("scroll", enterHandler)
        return () => {
            document.removeEventListener("scroll", enterHandler)
        }
    })

    return (
        <motion.div {...props} style={{ ...props.style, opacity }} ref={thisRef}>
            {props.children}
        </motion.div>
    )
}
