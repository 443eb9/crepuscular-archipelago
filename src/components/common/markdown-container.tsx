import Image from "next/image"
import Markdown from "react-markdown"
import SyntaxHighlighter from "react-syntax-highlighter"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import mdStyle from "./md-style"

export default function MarkdownContainer({ body }: { body: string }) {
    return (
        <Markdown
            className={"prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none"}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                img(props) {
                    return (
                        <Image
                            src={props.src ?? ""}
                            alt={props.alt ?? ""}
                            draggable={false}
                            style={{
                                width: "100%",
                                height: "auto"
                            }}
                            sizes="100vw"
                            width={0}
                            height={0}
                        >
                        </Image>
                    );
                },
                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
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
