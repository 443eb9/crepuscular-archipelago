import axios from "axios"
import { combineApi } from "./backend";
import { Island, IslandMeta, TagData } from "./model";

export async function fetchIslandMeta(id: number): Promise<IslandMeta> {
    return (await axios.get(combineApi(`/get/islandMeta/${id}`))).data;
}

export async function fetchIslandsMeta(start: number, length: number, tagsFilter: number): Promise<IslandMeta[]> {
    return (await axios.get(combineApi(`/get/islandsMeta/${start}/${length}/${tagsFilter}`))).data;
}

export async function fetchIslandTags(id: number): Promise<TagData[]> {
    return (await axios.get(combineApi(`/get/islandTags/${id}`))).data;
}

export async function fetchIslandsTags(start: number, length: number, tagsFilter: number): Promise<TagData[][]> {
    return (await axios.get(combineApi(`/get/islandsTags/${start}/${length}/${tagsFilter}`))).data;
}

export async function fetchAllTags(): Promise<TagData[]> {
    return (await axios.get(combineApi("/get/allTags"))).data;
}

export async function fetchIsland(id: number): Promise<Island> {
    return (await axios.get(combineApi(`/get/island/${id}`))).data;
}
