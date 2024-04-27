import { articles, tags } from "./mock";

export type CardData = {
    id: number,
    title: string,
    preview: string,
    tags: string[],
    date: string,
    is_achievement: boolean,
}

export type CardTag = {
    name: string,
    amount: number,
}

export async function fetchAllCards() {
    return articles;
}

export async function fetchAllTags() {
    return tags;
}
