'use client'

import { useState } from "react"
import { IoMenuSharp } from "react-icons/io5"
import NavButtonList from "./nav-button-list"
import OutlinedBox from "@/components/outlined-box"

export default function DropdownNav({ className }: { className?: string }) {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <div className={`relative ${className}`}>
            <button onClick={() => setExpanded(!isExpanded)}><IoMenuSharp className="text-4xl"></IoMenuSharp></button>
            <OutlinedBox
                className={`z-20 p-2 top-16 backdrop-blur-md ${isExpanded ? "block" : "hidden"} flex flex-col gap-2`}
                style={{
                    position: "absolute",
                    right: "calc(100% - 30px)"
                }}
            >
                <NavButtonList className="text-nowrap w-20 h-10" />
            </OutlinedBox>
        </div>
    )
}
