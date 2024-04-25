import { articles } from "./mock";

export type ArticleCardDataRaw = {
    title: string,
    preview: string,
    tags: string[],
    date: string,
}

export async function fetchArticleCards() {
    return articles;
}
