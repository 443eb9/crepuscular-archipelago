'use client';

import '@/app/global.css'
import ThemeSwither from './theme-swither';
import NavButton from './nav-button';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

export default function GlobalNavBar() {
    const [navOpacity, setNavOpacity] = useState(0);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", () => {
        const delta = scrollY.get() - window.innerHeight + 20;
        if (delta >= 0) {
            setNavOpacity(delta / window.innerHeight * 4);
        } else {
            setNavOpacity(0);
        }
    });

    return (
        <div style={{ opacity: `${navOpacity}` }}>
            <div className="fixed top-0 flex w-full h-14 pl-20 pr-20 justify-between items-center shadow-md border-neutral-900 dark:border-neutral-50 border-b-2 backdrop-blur-md z-10">
                <div className="flex flex-shrink-0 gap-2">
                    <h1 className="font-bender font-bold text-2xl">Crepuscular Archipelago</h1>
                    <ThemeSwither></ThemeSwither>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <NavButton title="首页" href={""}></NavButton>
                    <NavButton title="关于" href={""}></NavButton>
                </div>
            </div>
        </div>
    );
}
