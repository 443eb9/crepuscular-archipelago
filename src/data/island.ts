import axios from "axios"
import { combineApi } from "./backend";

export type IslandMeta = {
    id: number,
    title: string,
    preview: string,
    tags: number[],
    date: string,
    is_achievement: boolean,
}

export type IslandTag = {
    id: number,
    name: string,
    amount: number,
}

export async function fetchAllMeta() {
    return [];
}

export async function fetchAllIslandTags() {
    return (await axios.get(combineApi("/get/allTags"))).data;
}

export async function fetchIndex(): Promise<string[]> {
    return (await axios.get("https://raw.githubusercontent.com/443eb9/individual-islands/main/index.json")).data;
}

export async function fetchIslandMeta(id: number): Promise<IslandMeta | void> {
    const index = await fetchIndex();
    if (id >= index.length) {
        return new Promise((_, rej) => {
            rej("Invalid id");
        });
    }

    return (await axios.get(`https://raw.githubusercontent.com/443eb9/individual-islands/main/islands/${index}.meta.json`)).data;
}

export async function fetchIsland(id: number): Promise<string | void> {
    const index = await fetchIndex();
    if (id >= index.length || id < 0) {
        return new Promise((_, rej) => {
            rej("Invalid id");
        });
    }

    return (await axios.get(`https://raw.githubusercontent.com/443eb9/individual-islands/main/islands/${index[id]}.md`)).data;
}
