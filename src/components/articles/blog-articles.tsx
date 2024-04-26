import { fetchArticleCards } from "@/data/article";
import ArticleCard from "./article-card";

export default async function BlogArticles() {
    let cards = await fetchArticleCards();

    return (
        <div className="flex flex-col gap-10">
            {
                cards.map((data) => (
                    <ArticleCard card={data} key={data.title}></ArticleCard>
                ))
            }
        </div>
    );
}
