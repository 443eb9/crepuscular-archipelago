import { articles, tags } from "./mock";

export type ArticleCardData = {
    title: string,
    preview: string,
    tags: string[],
    date: string,
    id: number,
}

export type ArticleTag = {
    name: string,
    amount: number,
}

export async function fetchArticleCards() {
    return articles;
}

export async function fetchAllTags() {
    return tags;
}
