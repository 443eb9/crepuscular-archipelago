import { default as ReactMarkdown } from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { Prism } from "react-syntax-highlighter"
import markdownStyle from "./markdown-style"
import "./markdown.css"
import TitleText from "./text/title-text"
import BodyText from "./text/body-text"
import Link, { LinkProps } from "next/link"

export default function Markdown({ body }: { body: string }) {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                h1(props) { return <TitleText {...props} className="text-[2em] my-[0.3em]" /> },
                h2(props) { return <TitleText {...props} className="text-[1.5em] my-[0.5em]" /> },
                h3(props) { return <TitleText {...props} className="text-[1.17em] my-[1em]" /> },
                h4(props) { return <TitleText {...props} className="text-[1em] my-[1.33em]" /> },
                h5(props) { return <TitleText {...props} className="text-[.83em] my-[1.67em]" /> },
                h6(props) { return <TitleText {...props} className="text-[.67em] my-[2.33em]" /> },
                p(props) { return <BodyText {...props} className="py-1 text-wrap break-words" /> },
                img(props) { return <img src={props.src ?? ""} alt={props.src ?? ""} className="my-2 scale-50" /> },
                video(props) {
                    return (
                        <span className="flex justify-center w-full">
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
                            <BodyText children={props.children} className="italic" />
                        </blockquote>
                    )
                },
                th(props) {
                    return (
                        <th><BodyText {...props} className="text-center font-semibold py-1 border-light-dark-neutral border-b-[0.75px] border-dashed" /></th>
                    )
                },
                td(props) {
                    return (
                        <td><BodyText {...props} className="text-center" /></td>
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
                    return <ul {...props} className="mx-8"><BodyText children={props.children} /></ul>
                },
                li(props) {
                    return <li {...props}><BodyText children={props.children} /></li>
                },
                a(props) {
                    return <Link {...props as LinkProps} href={props.href ?? ""} target="_blank" className="underline" />
                },
            }}>
            {body}
        </ReactMarkdown>
    )
}
