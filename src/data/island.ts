import { AxiosError, AxiosResponse } from "axios";
import { combineApi } from "./backend";
import { get } from "./requests";
import { Island, IslandCount, IslandMeta, TagData } from "./model";

export class ErrorResponse {
    error: undefined | AxiosResponse<any, any>

    constructor(error: undefined | AxiosResponse<any, any>) {
        this.error = error
    }
}
export type Response<T> = ErrorResponse | AxiosResponse<T, any>;

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
