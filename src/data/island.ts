import axios from "axios"
import { combineApi as api } from "./backend";
import { Island, IslandMeta, TagData } from "./model";

export async function fetchIslandMeta(id: number): Promise<IslandMeta> {
    return (await axios.get(api(`/get/islandMeta/${id}`))).data;
}

export async function fetchIslandsMeta(start: number, length: number): Promise<IslandMeta[]> {
    return (await axios.get(api(`/get/islandsMeta/${start}/${length}`))).data;
}

export async function fetchIslandTags(id: number): Promise<TagData[]> {
    return (await axios.get(api(`/get/islandTags/${id}`))).data;
}

export async function fetchIslandsTags(start: number, length: number): Promise<TagData[][]> {
    return (await axios.get(api(`/get/islandsTags/${start}/${length}`))).data;
}

export async function fetchAllTags(): Promise<TagData[]> {
    return (await axios.get(api("/get/allTags"))).data;
}

export async function fetchIsland(id: number): Promise<Island> {
    return (await axios.get(api(`/get/island/${id}`))).data;
}
