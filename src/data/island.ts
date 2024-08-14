import axios from "axios"
import { combineApi } from "./backend";

export async function fetchAllTags() {
    return axios.get(combineApi("/get/allTags"));
}

export async function fetchIslandCount(tagsFilter: number, advancedFilter: number) {
    return axios.get(combineApi(`/get/islandCount/${tagsFilter}/${advancedFilter}`));
}

export async function fetchIslandMeta(id: number) {
    return axios.get(combineApi(`/get/islandMeta/${id}`));
}

export async function fetchIslandsMeta(page: number, length: number, tagsFilter: number, advancedFilter: number) {
    return axios.get(combineApi(`/get/islandsMeta/${page}/${length}/${tagsFilter}/${advancedFilter}`));
}

export async function fetchIsland(id: number) {
    return axios.get(combineApi(`/get/island/${id}`));
}
