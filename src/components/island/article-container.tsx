import ArticleBody from "./article-body"
import { fetchIsland, fetchIslandMeta } from "@/data/api"
import ArticleHeader from "./article-header"
import ArticleFooter from "./article-footer"
import NetworkErrorable from "../common/network-error-fallback"
import { IslandType } from "@/data/model"
import { notFound } from "next/navigation"

export default async function ArticleContainer({ id, params }: { id: number, params: URLSearchParams }) {
    const meta = await fetchIslandMeta(id)

    if (!meta.ok || meta.data.ty != IslandType.Article || meta.data.is_deleted) {
        notFound()
    }

    const article = await fetchIsland(id)

    return (
        <div className="flex flex-col gap-10 w-full">
            <NetworkErrorable resp={meta}>
                {data =>
                    <ArticleHeader meta={data} params={params}></ArticleHeader>
                }
            </NetworkErrorable>
            <NetworkErrorable resp={article}>
                {data =>
                    <ArticleBody body={data.content}></ArticleBody>
                }
            </NetworkErrorable>
            <ArticleFooter
                giscus={meta.ok && article.ok}
                params={params}
            ></ArticleFooter>
        </div>
    )
}
