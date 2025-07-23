import { apiEndpoint } from "./endpoints"
import { Island, IslandCount, IslandMapMeta, IslandMapQueryResult, IslandMapRegionCenters, IslandMeta, LinkExchangeData, TagData } from "./model"
import { LinkExchangeCache } from "./dummy-data"

export type Response<T> = {
    ok: true,
    data: T,
} | {
    ok: false,
    err: string,
}

export async function wrappedFetch<T>(url: string, method: "GET" | "POST", body?: BodyInit): Promise<Response<T>> {
    return await fetch(url, { cache: "no-cache", body, method })
        .then(async resp => {
            const body = await resp.text()

            if (!resp.ok) {
                return {
                    ok: false as false,
                    err: body,
                }
            }

            let data;
            try {
                data = JSON.parse(body)
            } catch {
                data = body
            }

            return {
                ok: true as true,
                data,
            }
        })
        .catch(err => {
            return {
                ok: false as false,
                err: err.toString(),
            }
        })
}

export async function wrappedApiGet<T>(endpoint: string): Promise<Response<T>> {
    return wrappedFetch(apiEndpoint(endpoint), "GET")
}

export async function wrappedApiPost<T>(endpoint: string, body: Object): Promise<Response<T>> {
    return wrappedFetch(apiEndpoint(endpoint), "POST", JSON.stringify(body))
}

export async function fetchAllTags(): Promise<Response<TagData[]>> {
    return wrappedApiGet(`/get/allTags`)
}

export async function fetchIslandCount(tagsFilter: number, advancedFilter: number): Promise<Response<IslandCount>> {
    return wrappedApiGet(`/get/island/count/${tagsFilter}/${advancedFilter}`)
}

export async function fetchIslandMeta(id: number): Promise<Response<IslandMeta>> {
    return wrappedApiGet(`/get/island/meta/${id}`)
}

export async function fetchIslandsMeta(page: number, length: number, tagsFilter: number, advancedFilter: number): Promise<Response<IslandMeta[]>> {
    return wrappedApiGet(`/get/island/metas/${page}/${length}/${tagsFilter}/${advancedFilter}`)
}

export async function fetchIsland(id: number): Promise<Response<Island>> {
    return wrappedApiGet(`/get/island/${id}`)
}

export function islandMapUrl(page: number) {
    return apiEndpoint(`/get/map/${page}`)
}

export function fetchIslandAt(page: number, x: number, y: number): Promise<Response<IslandMapQueryResult>> {
    return wrappedApiGet(`/get/map/${page}/${x}/${y}`)
}

export function fetchIslandMapMeta(): Promise<Response<IslandMapMeta>> {
    return wrappedApiGet(`/get/map/meta`)
}

export function fetchIslandMapRegionCenters(page: number): Promise<Response<IslandMapRegionCenters>> {
    return wrappedApiGet(`/get/map/${page}/centers`)
}

export async function fetchLinkExchange(): Promise<Response<LinkExchangeData[]>> {
    if (process.env.NODE_ENV == "production") {
        return wrappedFetch("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/friends.json", "GET")
    } else {
        // Network issue
        return { ok: true, data: LinkExchangeCache }
    }
}

export async function fetchGithubProjectStat(owner: string, name: string): Promise<Response<any>> {
    return wrappedFetch(`https://api.github.com/repos/${owner}/${name}`, "GET")
}
