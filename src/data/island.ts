import axios from "axios"
import { combineApi } from "./backend";

export async function fetchAllTags() {
    return axios.get(combineApi("/get/allTags"))
}

export async function fetchIslandCount() {
    return axios.get(combineApi("/get/islandCount"))
}

export async function fetchIslandMeta(id: number) {
    return axios.get(combineApi(`/get/islandMeta/${id}`))
}

export async function fetchIslandsMeta(start: number, length: number, tagsFilter: number) {
    return axios.get(combineApi(`/get/islandsMeta/${start}/${length}/${tagsFilter}`))
}

export async function fetchIsland(id: number) {
    return axios.get(combineApi(`/get/island/${id}`))
}
