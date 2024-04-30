import ArticleBody from "./article-body";
import { fetchIsland, fetchIslandMeta, fetchIslandTags } from "@/data/island";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";

export default async function ArticleContainer({ id }: { id: number }) {
    const meta = await fetchIslandMeta(id);
    const tags = await fetchIslandTags(id);
    const article = await fetchIsland(id);

    return (
        <div className="flex flex-col gap-10 w-full">
            <ArticleHeader meta={meta} tags={tags}></ArticleHeader>
            <ArticleBody body={article.content}></ArticleBody>
            <ArticleFooter></ArticleFooter>
        </div>
    );
}
