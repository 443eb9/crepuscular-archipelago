import { default as ReactMarkdown } from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { Prism } from "react-syntax-highlighter"
import Text from "./text"
import Link from "next/link"
import markdownStyle from "./markdown-style"
import "./markdown.css"
import Image from "./image"

export default function Markdown({ body }: { body: string }) {
    return (
        <ReactMarkdown
            className="w-full"
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                h1(props) { return <Text {...props} elem="h1" className="text-[2em] my-[0.3em]" /> },
                h2(props) { return <Text {...props} elem="h2" className="text-[1.5em] my-[0.5em]" /> },
                h3(props) { return <Text {...props} elem="h3" className="text-[1.17em] my-[1em]" /> },
                h4(props) { return <Text {...props} elem="h4" className="text-[1em] my-[1.33em]" /> },
                h5(props) { return <Text {...props} elem="h5" className="text-[.83em] my-[1.67em]" /> },
                h6(props) { return <Text {...props} elem="h6" className="text-[.67em] my-[2.33em]" /> },
                p(props) { return <Text elem="p" className="py-1" {...props} /> },
                img(props) { return <Image scale={0.5} src={props.src ?? ""} alt={props.src ?? ""} /> },
                video(props) {
                    return (
                        <span className="flex justify-center">
                            <video {...props} />
                        </span>
                    )
                },
                code(props) {
                    const { children, className, node, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return (
                        match ? (
                            <div className="bg-dark-background">
                                <Prism
                                    language={match[1]}
                                    style={markdownStyle as { [key: string]: React.CSSProperties }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </Prism>
                            </div>
                        ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        )
                    )
                },
                blockquote(props) {
                    return (
                        <blockquote {...props} className="border-l-2 px-1 opacity-50">
                            <Text children={props.children} className="italic" />
                        </blockquote>
                    )
                },
                th(props) {
                    return (
                        <th><Text {...props} className="text-center font-semibold py-1 border-light-dark-neutral border-b-[0.75px] border-dashed" /></th>
                    )
                },
                td(props) {
                    return (
                        <td><Text {...props} className="text-center" /></td>
                    )
                },
                table(props) {
                    return (
                        <div className="overflow-x-auto flex flex-col my-2 border-light-dark-neutral border-[1.5px]">
                            <table {...props} className="border-collapse" />
                        </div>
                    )
                },
                // @ts-ignore
                math(props) {
                    if (props.display == "block") {
                        return (
                            <div className="w-full overflow-x-auto overflow-y-hidden">
                                {/* @ts-ignore */}
                                <math {...props} />
                            </div>
                        )
                    } else {
                        return (
                            <span>
                                {/* @ts-ignore */}
                                <math {...props} />
                            </span>
                        )
                    }
                },
                ul(props) {
                    return <ul {...props} className="mx-8"><Text children={props.children} /></ul>
                },
                li(props) {
                    return <li {...props}><Text children={props.children} /></li>
                },
                a(props) {
                    return <Link {...props} href={props.href ?? ""} target="_blank" className="underline" />
                },
            }}>
            {body}
        </ReactMarkdown>
    )
}
