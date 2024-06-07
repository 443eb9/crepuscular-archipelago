import ArticleBody from "./article-body";
import { fetchIsland, fetchIslandMeta } from "@/data/island";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";

export default async function ArticleContainer({ id }: { id: number }) {
    const meta = (await fetchIslandMeta(id)).data;
    const article = (await fetchIsland(id)).data;

    return (
        <div className="flex flex-col gap-10 w-full">
            <ArticleHeader meta={meta}></ArticleHeader>
            <ArticleBody body={article.content}></ArticleBody>
            <ArticleFooter></ArticleFooter>
        </div>
    );
}
