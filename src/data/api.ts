import axios, { AxiosError } from "axios"
import { apiEndpoint } from "./backend"
import { Island, IslandCount, IslandMapMeta, IslandMapQueryResult, IslandMapRegionCenters, IslandMeta, LinkExchangeData, TagData } from "./model"
import { LinkExchangeCache } from "./dummy-data"

export type Response<T> = {
    ok: true,
    data: T,
} | {
    ok: false,
    err: string,
}

const axiosInstance = axios.create()

export async function wrappedGet<T>(url: string): Promise<Response<T>> {
    return await axiosInstance
        .get(url)
        .then(data => {
            return {
                ok: true as true,
                data: data.data as T
            }
        })
        .catch((reason: AxiosError) => {
            return {
                ok: false,
                err: `${url} ${reason.message}`
            }
        })
}

export async function wrappedApiGet<T>(endpoint: string): Promise<Response<T>> {
    return wrappedGet(apiEndpoint(endpoint))
}

export async function fetchAllTags(): Promise<Response<TagData[]>> {
    return wrappedApiGet("/get/allTags")
}

export async function fetchIslandCount(tagsFilter: number, advancedFilter: number): Promise<Response<IslandCount>> {
    return wrappedApiGet(`/get/islandCount/${tagsFilter}/${advancedFilter}`)
}

export async function fetchIslandMeta(id: number): Promise<Response<IslandMeta>> {
    return wrappedApiGet(`/get/islandMeta/${id}`)
}

export async function fetchIslandsMeta(page: number, length: number, tagsFilter: number, advancedFilter: number): Promise<Response<IslandMeta[]>> {
    return wrappedApiGet(`/get/islandsMeta/${page}/${length}/${tagsFilter}/${advancedFilter}`)
}

export async function fetchIsland(id: number): Promise<Response<Island>> {
    return wrappedApiGet(`/get/island/${id}`)
}

export function islandMapUrl(page: number) {
    return apiEndpoint(`/get/islandMap/${page}`)
}

export function fetchIslandAt(page: number, x: number, y: number): Promise<Response<IslandMapQueryResult>> {
    return wrappedApiGet(`/get/islandMap/${page}/${x}/${y}`)
}

export function fetchIslandMapMeta(): Promise<Response<IslandMapMeta>> {
    return wrappedApiGet(`/get/islandMap/meta`)
}

export function fetchIslandMapRegionCenters(page: number): Promise<Response<IslandMapRegionCenters>> {
    return wrappedApiGet(`/get/islandMap/${page}/centers`)
}

export async function fetchLinkExchange(): Promise<Response<LinkExchangeData[]>> {
    if (process.env.NODE_ENV == "production") {
        return wrappedGet("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/friends.json")
    } else {
        // Network issue
        return { ok: true, data: LinkExchangeCache }
    }
}

export async function fetchGithubProjectStat(owner: string, name: string): Promise<Response<any>> {
    return wrappedGet(`https://api.github.com/repos/${owner}/${name}`)
}
