import { apiEndpoint } from "./endpoints"
import { Island, IslandCount, IslandMapMeta, IslandMapQueryResult, IslandMapRegionCenters, IslandMeta, LinkExchangeData, TagData } from "./model"
import { LinkExchangeCache } from "./dummy-data"

export async function wrappedFetch<T>(url: string, method: "GET" | "POST", body?: BodyInit): Promise<T> {
    return await fetch(url, { cache: "no-cache", body, method }).then(r => r.json())
}

export async function wrappedApiGet<T>(endpoint: string): Promise<T> {
    return wrappedFetch(apiEndpoint(endpoint), "GET")
}

export async function wrappedApiPost<T>(endpoint: string, body: Object): Promise<T> {
    return wrappedFetch(apiEndpoint(endpoint), "POST", JSON.stringify(body))
}

export async function fetchAllTags(): Promise<TagData[]> {
    return wrappedApiGet(`/get/allTags`)
}

export async function fetchIslandCount(key: { tags: number, asvf: number }): Promise<IslandCount> {
    return wrappedApiGet(`/get/island/count/${key.tags}/${key.asvf}`)
}

export async function fetchIslandMeta(id: number): Promise<IslandMeta> {
    return wrappedApiGet(`/get/island/meta/${id}`)
}

export async function fetchIslandsMeta({ page, len, tags, advf }: { page: number, len: number, tags: number, advf: number }): Promise<IslandMeta[]> {
    return wrappedApiGet(`/get/island/metas/${page}/${len}/${tags}/${advf}`)
}

export async function fetchIsland({ id }: { id: number }): Promise<Island> {
    return wrappedApiGet(`/get/island/${id}`)
}

export function islandMapUrl(page: number) {
    return apiEndpoint(`/get/map/${page}`)
}

export function fetchIslandAt(page: number, x: number, y: number): Promise<IslandMapQueryResult> {
    return wrappedApiGet(`/get/map/${page}/${x}/${y}`)
}

export function fetchIslandMapMeta(): Promise<IslandMapMeta> {
    return wrappedApiGet(`/get/map/meta`)
}

export function fetchIslandMapRegionCenters(page: number): Promise<IslandMapRegionCenters> {
    return wrappedApiGet(`/get/map/${page}/centers`)
}

export async function fetchLinkExchange(): Promise<LinkExchangeData[]> {
    if (process.env.NODE_ENV == "production") {
        return wrappedFetch("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/friends.json", "GET")
    } else {
        // Network issue
        return { ok: true, data: LinkExchangeCache }
    }
}

export async function fetchGithubProjectStat(owner: string, name: string): Promise<any> {
    return wrappedFetch(`https://api.github.com/repos/${owner}/${name}`, "GET")
}
