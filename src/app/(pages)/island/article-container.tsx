import { notFound } from "next/navigation"
import ArticleHeader from "./article-header"
import ArticleBody from "./article-body"
import ArticleFooter from "./article-footer"
import { IslandMeta } from "@/data/model"
import OutlinedBox from "@/components/outlined-box"
import { QueryParams } from "@/data/search-param-util"

export default function ArticleContainer({ meta, content, params }: { meta: IslandMeta, params: QueryParams, content: string }) {
    if (meta.ty != "article" || meta.state == "deleted") {
        notFound()
    }

    return (
        <div className="flex flex-col gap-10 w-full">
            <OutlinedBox><ArticleHeader island={meta} params={params} /></OutlinedBox>
            <ArticleBody island={meta} body={content} />
            <ArticleFooter giscus params={params} />
        </div>
    )
}
