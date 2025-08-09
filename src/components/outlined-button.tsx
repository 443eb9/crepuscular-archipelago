"use client"

import { HTMLAttributes, useState } from "react"
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

export default function OutlinedButton({ inv, animTo, ...props }: { inv?: boolean, animTo?: "top" | "right" | "left" | "bottom" } & HTMLAttributes<HTMLButtonElement>) {
    const [hover, setHover] = useState(false)

    const _animTo = animTo ?? "top"
    const horizontal = _animTo == "right" || _animTo == "left"

    return (
        <button
            {...props}
            className={
                `flex relative border-2
                ${inv ? "bg-accent-0 border-accent-0 hover:border-dark-0 hover:dark:border-light-0" : "border-dark-0 dark:border-light-0"}
                ${props.className}`
            }
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="absolute w-full h-full flex -z-10" style={{ justifyContent: _animTo == "left" ? "end" : "start", alignItems: _animTo == "top" ? "end" : "start" }}>
                <AnimatePresence>
                    {
                        hover && !inv &&
                        <motion.div
                            initial={{ width: horizontal ? "0%" : "100%", height: horizontal ? "100%" : "0%" }}
                            animate={{ width: horizontal ? "100%" : "100%", height: horizontal ? "100%" : "100%", transition: { duration: 0.2, ease: "easeOut" } }}
                            exit={{ width: horizontal ? "0%" : "100%", height: horizontal ? "100%" : "0%", transition: { duration: 0.2, ease: "easeOut" } }}
                            className="absolute bg-accent-0"
                        />
                    }
                </AnimatePresence>
            </div>
            {props.children}
        </button>
    )
}
