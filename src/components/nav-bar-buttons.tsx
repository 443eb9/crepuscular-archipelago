"use client"

import Link from "next/link";
import OutlinedButton from "./outlined-button";
import TitleText from "./text/title-text";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useState } from "react";

const data: { text: string, href?: string, submenus?: { text: string, href: string }[] }[] = [
    {
        text: "内容",
        submenus: [
            {
                text: "地图",
                href: "/map",
            },
            {
                text: "动态",
                href: "/updates",
            },
        ],
    },
    {
        text: "元数据",
        submenus: [
            {
                text: "关于",
                href: "/about",
            },
            {
                text: "友链",
                href: "/friends",
            },
        ],
    },
    {
        text: "开往",
        href: "https://www.travellings.cn/go.html",
    },
]

export default function NavBarButtons({ flipped }: { flipped?: boolean }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return data.map((item, i) =>
        <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <OutlinedButton
                className="flex justify-center items-center w-20 h-10"
                animTo="bottom"
            >
                {
                    item.href
                        ? <Link className="w-full h-full flex justify-center items-center" href={item.href}>
                            <TitleText style={{ scale: flipped ? "1 -1" : undefined }}>{item.text}</TitleText>
                        </Link>
                        : <TitleText style={{ scale: flipped ? "1 -1" : undefined }}>{item.text}</TitleText>
                }
                <AnimatePresence>
                    {
                        hoveredIndex == i && item.submenus &&
                        <motion.div
                            className="absolute w-20 top-full flex flex-col bg-accent-0 overflow-clip border-2 border-t-0 border-dark-0 dark:border-light-0"
                            initial={{ height: "0" }}
                            animate={{ height: "auto", transition: { delay: 0.18 } }}
                            exit={{ height: "0" }}
                        >
                            {item.submenus.map((submenu, i) =>
                                <Link key={i} href={submenu.href} className="min-w-20 min-h-10 flex justify-center items-center">
                                    <TitleText style={{ scale: flipped ? "1 -1" : undefined }}>{submenu.text}</TitleText>
                                </Link>
                            )}
                        </motion.div>
                    }
                </AnimatePresence>
            </OutlinedButton>
        </div>
    )
}
