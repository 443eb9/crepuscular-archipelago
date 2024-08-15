import ArticleBody from "./article-body";
import { ErrorResponse, fetchIsland, fetchIslandMeta } from "@/data/island";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";
import BackendErrorFallback from "../common/backend-error-fallback";
import { IslandType } from "@/data/model";
import { notFound } from "next/navigation";

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
                    ? <BackendErrorFallback error={meta}></BackendErrorFallback>
                    : <ArticleHeader meta={meta.data} params={params}></ArticleHeader>
            }
            {
                article instanceof ErrorResponse
                    ? <BackendErrorFallback error={article}></BackendErrorFallback>
                    : <ArticleBody body={article.data.content}></ArticleBody>
            }
            <ArticleFooter
                giscus={!(meta instanceof ErrorResponse) && !(article instanceof ErrorResponse)}
                params={params}
            ></ArticleFooter>
        </div>
    );
}
