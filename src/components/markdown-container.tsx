"use client"

import { default as ReactMarkdown } from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import Image from "next/image"
import { Prism } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useEffect, useRef, useState } from "react"

export default function MarkdownContainer({ body }: { body: string }) {
    const [mediaWidth, setMediaWidth] = useState<number | undefined>()
    const containerRef = useRef<HTMLDivElement>(null)

    const updateWidth = () => {
        if (containerRef.current) {
            console.log(window.innerWidth, window.outerWidth)
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
                        code(props) {
                            const { children, className, node, ...rest } = props
                            const match = /language-(\w+)/.exec(className || '')
                            return (
                                match ? (
                                    <Prism
                                        language={match[1]}
                                        style={vscDarkPlus}
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
                    }}>
                    {body}
                </ReactMarkdown>
            }
        </div>
    )
}
