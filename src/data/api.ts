import { combineApi } from "./backend";
import { get } from "./requests";
import { Island, IslandCount, IslandMeta, ProjectData, TagData } from "./model";
import { Response } from "./requests";

export async function fetchAllTags(): Promise<Response<TagData[]>> {
    return get(combineApi("/get/allTags"));
}

export async function fetchIslandCount(tagsFilter: number, advancedFilter: number): Promise<Response<IslandCount>> {
    return get(combineApi(`/get/islandCount/${tagsFilter}/${advancedFilter}`));
}

export async function fetchIslandMeta(id: number): Promise<Response<IslandMeta>> {
    return get(combineApi(`/get/islandMeta/${id}`));
}

export async function fetchIslandsMeta(page: number, length: number, tagsFilter: number, advancedFilter: number): Promise<Response<IslandMeta[]>> {
    return get(combineApi(`/get/islandsMeta/${page}/${length}/${tagsFilter}/${advancedFilter}`));
}

export async function fetchIsland(id: number): Promise<Response<Island>> {
    return get(combineApi(`/get/island/${id}`));
}

export async function fetchProjectList(): Promise<Response<ProjectData[]>> {
    return get(combineApi("/get/projects"));
}
