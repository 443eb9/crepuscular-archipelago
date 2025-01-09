import { notFound } from "next/navigation"
import ArticleHeader from "./article-header"
import ArticleBody from "./article-body"
import ArticleFooter from "./article-footer"
import { IslandMeta } from "@/data/model"
import OutlinedBox from "@/components/outlined-box"

export default function ArticleContainer({ meta, content, params }: { meta: IslandMeta, params: URLSearchParams, content: string }) {
    if (meta.ty != "article" || meta.isDeleted) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-10 w-full">
            <OutlinedBox><ArticleHeader island={meta} params={params} /></OutlinedBox>
            <ArticleBody body={content} />
            <ArticleFooter giscus params={params} />
        </div>
    )
}
