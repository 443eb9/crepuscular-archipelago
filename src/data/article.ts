import axios from "axios"
import { ArticleMeta } from "./card";

export async function fetchIndex(): Promise<string[]> {
    return (await axios.get("https://raw.githubusercontent.com/443eb9/individual-islands/main/index.json")).data;
}

export async function fetchMeta(id: number): Promise<ArticleMeta | void> {
    const index = await fetchIndex();
    if (id >= index.length) {
        return new Promise((_, rej) => {
            rej("Invalid id");
        });
    }

    return (await axios.get(`https://raw.githubusercontent.com/443eb9/individual-islands/main/islands/${index}.meta.json`)).data;
}

export async function fetchArticle(id: number): Promise<string | void> {
    const index = await fetchIndex();
    if (id >= index.length || id < 0) {
        return new Promise((_, rej) => {
            rej("Invalid id");
        });
    }

    return (await axios.get(`https://raw.githubusercontent.com/443eb9/individual-islands/main/islands/${index[id]}.md`)).data;
}
