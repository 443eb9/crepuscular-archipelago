'use client';

import '@/app/global.css'
import { useTheme } from "next-themes";
import { IoMoonSharp, IoSunnySharp } from "react-icons/io5";
import { useEffect, useState } from "react";

export default function ThemeSwither() {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return null;
    }

    if (resolvedTheme == 'light') {
        return (
            <button onClick={() => { setTheme('dark') }} >
                <IoSunnySharp className="text-4xl"></IoSunnySharp>
            </button>
        );
    }

    if (resolvedTheme == 'dark') {
        return (
            <button onClick={() => { setTheme('light') }} >
                <IoMoonSharp className="text-4xl"></IoMoonSharp>
            </button>
        );
    }
}
