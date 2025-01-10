"use client"

import { default as ReactMarkdown } from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import Image from "next/image"
import { Prism } from "react-syntax-highlighter"
import { useEffect, useRef, useState } from "react"
import Text from "./text"
import Link from "next/link"
import markdownStyle from "./markdown-style"

export default function Markdown({ body }: { body: string }) {
    const [mediaWidth, setMediaWidth] = useState<number | undefined>()
    const containerRef = useRef<HTMLDivElement>(null)

    const updateWidth = () => {
        if (containerRef.current) {
            setMediaWidth(containerRef.current.clientWidth * 0.5)
        }
    }

    useEffect(() => {
        updateWidth()

        window.addEventListener("resize", updateWidth)
        return () => {
            window.removeEventListener("resize", updateWidth)
        }
    }, [])

    return (
        <div className="w-full" ref={containerRef}>
            {
                mediaWidth &&
                <ReactMarkdown
                    className={"prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none"}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    components={{
                        h1(props) { return <Text {...props} elem="h1" className="text-[2em] my-[0.67em]" /> },
                        h2(props) { return <Text {...props} elem="h2" className="text-[1.5em] my-[0.83em]" /> },
                        h3(props) { return <Text {...props} elem="h3" className="text-[1.17em] my-[1em]" /> },
                        h4(props) { return <Text {...props} elem="h4" className="text-[1em] my-[1.33em]" /> },
                        h5(props) { return <Text {...props} elem="h5" className="text-[.83em] my-[1.67em]" /> },
                        h6(props) { return <Text {...props} elem="h6" className="text-[.67em] my-[2.33em]" /> },
                        p(props) { return <Text elem="p" className="py-1" {...props} /> },
                        img(props) {
                            return (
                                <div className="w-full flex justify-center m-2">
                                    <Image
                                        src={props.src ?? ""}
                                        alt={props.src ?? ""}
                                        width={mediaWidth}
                                        height={0}
                                        objectFit="cover"
                                    />
                                </div>
                            )
                        },
                        video(props) {
                            return (
                                <div className="w-full flex justify-center">
                                    <video {...props} />
                                </div>
                            )
                        },
                        code(props) {
                            const { children, className, node, ...rest } = props
                            const match = /language-(\w+)/.exec(className || '')
                            return (
                                match ? (
                                    <Prism
                                        language={match[1]}
                                        style={markdownStyle as { [key: string]: React.CSSProperties }}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </Prism>
                                ) : (
                                    <code {...rest} className={className}>
                                        {children}
                                    </code>
                                )
                            )
                        },
                        blockquote(props) {
                            return (
                                <blockquote {...props} className="border-l-4 px-2 py-1">
                                    <Text children={props.children} className="italic" />
                                </blockquote>
                            )
                        },
                        th(props) {
                            return (
                                <th><Text {...props} className="text-center font-semibold py-1" /></th>
                            )
                        },
                        td(props) {
                            return (
                                <td><Text {...props} className="text-center" /></td>
                            )
                        },
                        table(props) {
                            return (
                                <div className="overflow-x-auto flex flex-col py-2">
                                    <table {...props} />
                                </div>
                            )
                        },
                        // @ts-ignore
                        math(props) {
                            return (
                                <span className="overflow-x-auto overflow-y-hidden">
                                    {/* @ts-ignore */}
                                    <math {...props} />
                                </span>
                            )
                        },
                        ul(props) {
                            return <ul {...props} className="mx-4"><Text children={props.children} /></ul>
                        },
                        li(props) {
                            return <li {...props}><Text children={props.children} /></li>
                        },
                        a(props) {
                            return <Link {...props} href={props.href ?? ""} target="_blank" className="text-accent-light dark:text-accent-dark underline" />
                        },
                    }}>
                    {body}
                </ReactMarkdown>
            }
        </div>
    )
}
