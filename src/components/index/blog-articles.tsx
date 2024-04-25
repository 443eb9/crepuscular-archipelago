import { fetchArticleCards } from "@/data/article-card";
import ArticleCard from "./article-card";

export default async function BlogArticles() {
    let cards = await fetchArticleCards();

    return (
        <div className="flex w-full justify-center">
            <div className="flex flex-col gap-20 w-1/2">
                {
                    cards.map((data) => (
                        <ArticleCard card={data} key={data.title}></ArticleCard>
                    ))
                }
            </div>
        </div>
    );
}
