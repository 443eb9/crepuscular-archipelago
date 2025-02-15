"use client"

import { FoamData } from "@/data/model";
import Foam from "./foam";
import { useEffect, useRef, useState } from "react";

export default function FoamsGrid({ foams }: { foams: FoamData[] }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [cols, setRows] = useState<number | undefined>(undefined)

    useEffect(() => {
        const resizeHandler = () => {
            if (containerRef.current) {
                setRows(Math.round(containerRef.current.clientWidth / 400))
            }
        }

        resizeHandler()
        window.addEventListener("resize", resizeHandler)
        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="grid gap-2"
            style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
            }}
        >
            {
                cols != undefined &&
                foams
                    .reverse()
                    .map(foam =>
                        <Foam foam={foam} />
                    )
            }
        </div>
    )
}
