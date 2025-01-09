import OutlinedBox from "@/components/outlined-box"
import Markdown from "@/components/markdown"

export default function ArticleBody({ body }: { body: string }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            <OutlinedBox className="px-5 py-8">
                <Markdown body={body}></Markdown>
            </OutlinedBox>
        </div>
    )
}
