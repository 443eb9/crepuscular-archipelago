import ArticleBody from "./article-body";
import { fetchAllIslandTags, fetchIsland, fetchIslandMeta } from "@/data/island";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";
import { Suspense } from "react";

export default async function ArticleContainer({ id }: { id: number }) {
    const meta = await fetchIslandMeta(id);
    if (meta == null) {
        return null;
    }
    const article = await fetchIsland(id);
    if (article == null) {
        return null;
    }
    const tags = await fetchAllIslandTags();

    return (
        <Suspense>
            <ArticleHeader meta={meta} tags={tags}></ArticleHeader>
            <ArticleBody body={article}></ArticleBody>
            <ArticleFooter></ArticleFooter>
        </Suspense>
    );
}
