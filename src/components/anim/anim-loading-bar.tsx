"use client"

import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { HTMLAttributes, ReactNode, useEffect, useState } from "react";

export default function AnimLoadingBar(props: HTMLAttributes<HTMLDivElement>) {
    const [state, setState] = useState(true)

    useEffect(() => {
        const handle = setTimeout(() => setState(!state), 400)

        return () => {
            clearTimeout(handle)
        }
    }, [state])

    return (
        <div {...props} className={"relative flex w-full " + props.className}>
            <div className="absolute w-full h-full bg-dark-0 dark:bg-light-0" />
            <div className="absolute z-20 w-full h-full flex justify-center items-center">
                <div className="absolute flex w-[calc(100%-7px)] h-[calc(100%-5px)]" style={{ justifyContent: state ? "flex-start" : "flex-end" }}>
                    <AnimatePresence>
                        {
                            state &&
                            <motion.div
                                className="absolute h-full z-20 bg-accent-0"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%", transition: { duration: 0.2, ease: "easeOut" } }}
                                exit={{ width: "0%", transition: { duration: 0.2, ease: "easeOut" } }}
                            />
                        }
                    </AnimatePresence>
                    <div className="absolute flex items-center w-full h-full z-20">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    )
}
