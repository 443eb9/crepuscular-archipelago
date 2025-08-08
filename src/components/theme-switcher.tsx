"use client"

import { useTheme } from "next-themes"
import { IoMoonSharp, IoSunnySharp } from "react-icons/io5"
import { HTMLAttributes, useEffect, useState } from "react"

export default function ThemeSwitcher(props: HTMLAttributes<HTMLButtonElement>) {
    const [mounted, setMounted] = useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return null
    }

    switch (resolvedTheme) {
        case "dark": return (
            <button
                {...props}
                className={"flex justify-center items-center " + props.className}
                onClick={() => setTheme("light")}
            >
                <IoSunnySharp className="text-4xl text-light-0 hover:text-accent-0" />
            </button>
        )
        case "light": return (
            <button
                {...props}
                className={"flex justify-center items-center " + props.className}
                onClick={() => setTheme("dark")}
            >
                <IoMoonSharp className="text-4xl text-dark-0 hover:text-accent-0" />
            </button>
        )
        default: return null
    }
}
