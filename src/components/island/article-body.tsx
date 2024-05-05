import Markdown from "react-markdown";
import OutlinedBox from "../common/outlined-box";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import '@/components/common/md-style';
import mdStyle from "@/components/common/md-style";
import rehypeRaw from "rehype-raw";

export default async function ArticleBody({ body }: { body: string }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            <OutlinedBox className="px-5 py-8">
                <Markdown className={"prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none"} rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]} components={{
                    code(props) {
                        const { children, className, node, ...rest } = props
                        const match = /language-(\w+)/.exec(className || '')
                        return (
                            match ? (
                                <SyntaxHighlighter
                                    language={match[1]}
                                    // @ts-expect-error
                                    style={mdStyle}
                                />
                            ) : (
                                <code {...rest} className={className}>
                                    {String(children).replace(/\n$/, '')}
                                </code>
                            )
                        )
                    },
                }}>
                    {body}
                </Markdown>
            </OutlinedBox>
        </div>
    );
}
