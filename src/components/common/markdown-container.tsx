import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import mdStyle from "./md-style"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import Image from "next/image"
import NextImage from "./next-image"

export default function MarkdownContainer({ body }: { body: string }) {
    return (
        <Markdown
            className={"prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none"}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                img(props) {
                    return (
                        <NextImage src={props.src ?? ""} alt={props.alt ?? ""}></NextImage>
                    )
                },
                code(props) {
                    const { children, className, node, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return (
                        match ? (
                            <SyntaxHighlighter
                                language={match[1]}
                                // @ts-expect-error
                                style={mdStyle}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        )
                    )
                },
            }}>
            {body}
        </Markdown>
    )
}
