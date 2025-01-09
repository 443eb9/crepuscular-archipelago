import axios, { AxiosError } from "axios"
import { combineApi } from "./backend"
import { Bookmarks, Island, IslandCount, IslandMapMeta, IslandMapQueryResult, IslandMapRegionCenters, IslandMeta, LinkExchangeData, ProjectData, SteamPlayerSummaries, SteamRecentlyPlayedGames, TagData } from "./model"

export type Response<T> = {
    ok: true,
    data: T,
} | {
    ok: false,
    err: string,
}

const axiosInstance = axios.create()

async function wrappedGet<T>(url: string): Promise<Response<T>> {
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

async function wrappedApiGet<T>(endpoint: string): Promise<Response<T>> {
    return wrappedGet(combineApi(endpoint))
}

async function wrappedRemoteApiGet<T>(endpoint: string): Promise<Response<T>> {
    return wrappedGet(combineApi(endpoint))
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

export async function fetchProjectList(): Promise<Response<ProjectData[]>> {
    return wrappedApiGet("/get/projects")
}

export function islandMapUrl(page: number) {
    return combineApi(`/get/islandMap/${page}`)
}

export function fetchIslandAt(page: number, x: number, y: number): Promise<Response<IslandMapQueryResult>> {
    return wrappedRemoteApiGet(`/get/islandMap/${page}/${x}/${y}`)
}

export function fetchIslandMapMeta(): Promise<Response<IslandMapMeta>> {
    return wrappedApiGet(`/get/islandMap/meta`)
}

export function fetchIslandMapRegionCenters(page: number): Promise<Response<IslandMapRegionCenters>> {
    return wrappedApiGet(`/get/islandMap/${page}/centers`)
}

const steamKey = process.env.STEAM_KEY
const steamUserId = process.env.STEAM_USER_ID

export async function fetchSteamRecentlyPlayedGames(): Promise<Response<{ response: SteamRecentlyPlayedGames }>> {
    if (steamKey && steamUserId) {
        return wrappedGet(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamKey}&steamid=${steamUserId}&format=json`)
    } else {
        return {
            ok: false,
            err: "No secret provided.",
        }
    }
}

export async function fetchSteamPlayerSummaries(): Promise<Response<{ response: SteamPlayerSummaries }>> {
    if (steamKey && steamUserId) {
        return wrappedGet(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamUserId}`)
    } else {
        return {
            ok: false,
            err: "No secret provided.",
        }
    }
}

export async function fetchBookmarks(): Promise<Response<Bookmarks[]>> {
    return wrappedGet("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/bookmarks.json")
}

export async function fetchLinkExchange(): Promise<Response<LinkExchangeData[]>> {
    return wrappedGet("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/friends.json")
}

export async function fetchGithubProjectStat(owner: string, name: string): Promise<Response<any>> {
    return wrappedGet(`https://api.github.com/repos/${owner}/${name}`)
}
