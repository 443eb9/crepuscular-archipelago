import { combineApi } from "./backend";
import { ErrorResponse, get } from "./requests";
import { Island, IslandCount, IslandMeta, ProjectData, SteamPlayerSummaries, SteamRecentlyPlayedGames, TagData } from "./model";
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

export async function fetchSteamRecentlyPlayedGames(): Promise<Response<{ response: SteamRecentlyPlayedGames }>> {
    const key = process.env.STEAM_KEY;
    const userId = process.env.STEAM_USER_ID;
    if (key && userId) {
        return get(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${userId}&format=json`);
    } else {
        return new ErrorResponse(undefined);
    }
}

export async function fetchSteamPlayerSummaries(): Promise<Response<{response: SteamPlayerSummaries}>> {
    const key = process.env.STEAM_KEY;
    const userId = process.env.STEAM_USER_ID;
    if (key && userId) {
        return get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${userId}`);
    } else {
        return new ErrorResponse(undefined);
    }
}
