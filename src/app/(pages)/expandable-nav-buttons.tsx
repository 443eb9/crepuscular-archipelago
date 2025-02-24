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

    const NavButton = ({ content, href, target, children, submenus }: { content: string, href?: string, target?: string, children?: ReactNode, submenus?: number }) => {
        return (
            <div
                className={`relative ${suppressPanelClose}`}
                onClick={() => {
                    if (!href) {
                        setExpand(expand == content ? undefined : content)
                    }
                }}
            >
                <OutlinedButton className={`w-20 h-10 backdrop-blur-md ${className}`}>
                    {
                        href
                            ?
                            <LinkNoPrefetch href={href} target={target}>
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
            </div>
        )
    }
    return (
        <>
            <NavButton content="首页" href="/" />
            <NavButton content="内容" submenus={3}>
                <NavButton content="地图" href="/map" />
                <NavButton content="动态" href="/updates" />
                <NavButton content="泡沫" href="/foams" />
            </NavButton>
            <NavButton content="元数据" submenus={3}>
                <NavButton content="关于" href="/about" />
                <NavButton content="友链" href="/friends" />
                <NavButton content="设置" href="/settings" />
            </NavButton>
            <NavButton content="开往" href="https://www.travellings.cn/go.html" target="_blank" />
        </>
    )
}
