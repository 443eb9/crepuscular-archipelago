import OutlinedBox from "@/components/outlined-box"
import MarkdownContainer from "@/components/markdown-container"

export default async function ArticleBody({ body }: { body: string }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            <OutlinedBox className="px-5 py-8">
                <MarkdownContainer body={body}></MarkdownContainer>
            </OutlinedBox>
        </div>
    )
}
