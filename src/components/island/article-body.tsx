import OutlinedBox from "../common/outlined-box"
import "katex/dist/katex.min.css"
import '@/components/common/md-style'
import MarkdownContainer from "../common/markdown-container"

export default async function ArticleBody({ body }: { body: string }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            <OutlinedBox className="px-5 py-8">
                <MarkdownContainer body={body}></MarkdownContainer>
            </OutlinedBox>
        </div>
    )
}
