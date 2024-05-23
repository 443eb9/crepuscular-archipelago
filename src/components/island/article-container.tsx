import ArticleBody from "./article-body";
import { fetchIsland, fetchIslandMeta } from "@/data/island";
import ArticleHeader from "./article-header";
import ArticleFooter from "./article-footer";
import { notFound } from "next/navigation";

export default async function ArticleContainer({ id }: { id: number }) {
    const meta = await fetchIslandMeta(id)
        .catch((_) => notFound())
        .then((value) => {
            if (value == null) {
                return;
            }
            return value.data;
        });
    const article = await fetchIsland(id)
        .catch((_) => notFound())
        .then((value) => {
            if (value == null) {
                return;
            }
            return value.data;
        });;

    return (
        <div className="flex flex-col gap-10 w-full">
            <ArticleHeader meta={meta}></ArticleHeader>
            <ArticleBody body={article.content}></ArticleBody>
            <ArticleFooter></ArticleFooter>
        </div>
    );
}
