"use client"

import LinkNoPrefetch from "@/components/link-no-prefetch"
import OutlinedButton from "@/components/outlined-button"
import Text from "@/components/text"
import { findClassNameAmong } from "@/data/utils"
import { ReactNode, useEffect, useState } from "react"

const suppressPanelClose = "suppress-panel-close"

export default function ExpandableNavButtons({ className, expandAbove }: { className?: string, expandAbove?: boolean }) {
    const [expand, setExpand] = useState<string | undefined>()

    useEffect(() => {
        const clickHandler = (ev: MouseEvent) => {
            if (!findClassNameAmong(ev.target as HTMLElement, suppressPanelClose)) {
                setExpand(undefined)
            }
        }

        window.addEventListener("mousedown", clickHandler)
        return () => {
            window.removeEventListener("mousedown", clickHandler)
        }
    }, [])

    const NavButton = ({ content, target, children, submenus }: { content: string, target?: string, children?: ReactNode, submenus?: number }) => {
        return (
            <button
                className={`relative backdrop-blur-md ${suppressPanelClose}`}
                onClick={() => {
                    if (!target) {
                        setExpand(expand == content ? undefined : content)
                    }
                }}
            >
                <OutlinedButton className={`w-20 h-10 ${className}`}>
                    {
                        target
                            ?
                            <LinkNoPrefetch href={target}>
                                <Text elem="h3">{content}</Text>
                            </LinkNoPrefetch>
                            : <Text elem="h3">{content}</Text>
                    }
                </OutlinedButton>
                {
                    expand == content && submenus != undefined &&
                    <div className="absolute flex flex-col gap-1" style={{ marginTop: expandAbove ? `calc(-${(submenus / 2) * 100}% - ${submenus * 4}px - 80px)` : "4px" }}>
                        {children}
                    </div>
                }
            </button>
        )
    }
    return (
        <>
            <NavButton content="首页" target="/" />
            <NavButton content="内容" submenus={3}>
                <NavButton content="地图" target="/map" />
                <NavButton content="动态" target="/updates" />
                <NavButton content="泡沫" target="/foams" />
            </NavButton>
            <NavButton content="元数据" submenus={3}>
                <NavButton content="关于" target="/about" />
                <NavButton content="友链" target="friends" />
                <NavButton content="设置" target="settings" />
            </NavButton>
        </>
    )
}
