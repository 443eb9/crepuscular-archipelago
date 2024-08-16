import ArticleBody from "./article-body";
import { fetchIsland, fetchIslandMeta } from "@/data/api";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";
import NetworkErrorFallback from "../common/network-error-fallback";
import { IslandType } from "@/data/model";
import { notFound } from "next/navigation";
import { ErrorResponse } from "@/data/requests";

export default async function ArticleContainer({ id, params }: { id: number, params: URLSearchParams }) {
    const meta = await fetchIslandMeta(id);
    const article = await fetchIsland(id);

    if (!(meta instanceof ErrorResponse) && meta.data.ty != IslandType.Article) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-10 w-full">
            {
                meta instanceof ErrorResponse
                    ? <NetworkErrorFallback error={meta}></NetworkErrorFallback>
                    : <ArticleHeader meta={meta.data} params={params}></ArticleHeader>
            }
            {
                article instanceof ErrorResponse
                    ? <NetworkErrorFallback error={article}></NetworkErrorFallback>
                    : <ArticleBody body={article.data.content}></ArticleBody>
            }
            <ArticleFooter
                giscus={!(meta instanceof ErrorResponse) && !(article instanceof ErrorResponse)}
                params={params}
            ></ArticleFooter>
        </div>
    );
}
