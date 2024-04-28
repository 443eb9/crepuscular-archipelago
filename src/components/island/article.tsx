import { fetchArticle } from "@/data/article";
import Markdown from "react-markdown";
import OutlinedBox from "../common/outlined-box";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css'
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import '@/components/common/md-style';
import mdStyle from "@/components/common/md-style";
import CodeBlock from "../common/code-block";
import rehypeRaw from "rehype-raw";

export default async function Article({ id }: { id: number }) {
    const article = await fetchArticle(id);

    if (article == null) {
        return null;
    }

    return (
        <OutlinedBox className="flex flex-col gap-2 w-full box-border p-5">
            <Markdown rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]} components={{
                code(props) {
                    const { children, className, node, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return (
                        <CodeBlock lang={match ? match[1] : "unknown"}>
                            {
                                match ? (
                                    <SyntaxHighlighter
                                        PreTag="div"
                                        children={String(children).replace(/\n$/, '')}
                                        language={match[1]}
                                        style={mdStyle}
                                    />
                                ) : (
                                    <code {...rest} className={className}>
                                        {children}
                                    </code>
                                )
                            }
                        </CodeBlock>
                    )
                },
            }}>
                {article}
            </Markdown>
        </OutlinedBox>
    );
}
