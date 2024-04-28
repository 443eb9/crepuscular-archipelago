import { cards, tags } from "./mock";

export type ArticleMeta = {
    id: number,
    title: string,
    preview: string,
    tags: number[],
    date: string,
    is_achievement: boolean,
}

export type ContentTag = {
    name: string,
    amount: number,
}

export async function fetchAllMeta() {
    return cards;
}

export async function fetchAllTags() {
    return tags;
}
