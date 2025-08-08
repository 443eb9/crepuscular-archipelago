"use client"

import { useTheme } from "next-themes"
import { IoMoonSharp, IoSunnySharp } from "react-icons/io5"
import { useEffect, useState } from "react"
import OutlinedBox from "./outlined-box"

export default function ThemeSwither({ className }: { className?: string }) {
    const [mounted, setMounted] = useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return null
    }

    const SwitcherButton = () => {
        if (resolvedTheme == "light") {
            return (
                <button className={className} onClick={() => { setTheme("dark") }} >
                    <IoSunnySharp className="text-4xl" />
                </button>
            )
        }

        if (resolvedTheme == "dark") {
            return (
                <button className={className} onClick={() => { setTheme("light") }} >
                    <IoMoonSharp className="text-4xl" />
                </button>
            )
        }
    }

    return (
        <OutlinedBox className="p-4 flex justify-between items-center">
            <SwitcherButton />
        </OutlinedBox>
    )
}
