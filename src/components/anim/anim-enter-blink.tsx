"use client"

import { HTMLMotionProps, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import * as motion from "motion/react-client";
import { lerp } from "@/data/utils";

export default function AnimEnterBlink({ durationRange, blinkCountRange, ...props }: { durationRange: [number, number], blinkCountRange: [number, number] } & HTMLMotionProps<"div">) {
    const opacity = useMotionValue(0)
    const thisRef = useRef<HTMLDivElement>(null)
    const animTriggered = useRef(false)

    const animator = async () => {
        const t = Math.round(lerp(blinkCountRange[0], blinkCountRange[1], Math.random()))
        for (let i = 0; i < t; i++) {
            opacity.set(1)
            await new Promise(resolve => setTimeout(resolve, lerp(durationRange[0], durationRange[1], Math.random())))
            opacity.set(0)
            await new Promise(resolve => setTimeout(resolve, lerp(durationRange[0], durationRange[1], Math.random())))
        }
        opacity.set(1)
    }

    const enterHandler = () => {
        console.log("BBBBBBBBBB")
        if (!thisRef.current) return
        const bounding = thisRef.current.getBoundingClientRect()
        if (bounding.bottom > 0 && bounding.top < document.documentElement.clientHeight && !animTriggered.current) {
            animTriggered.current = true
            console.log("AAAAAAAA")
            animator()
        }
    }

    useEffect(() => {
        opacity.set(0)
        animTriggered.current = false
        enterHandler()
    })

    useEffect(() => {
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
