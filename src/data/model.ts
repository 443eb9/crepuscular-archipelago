import { AxiosResponse } from "axios";

export enum IslandType {
    Article,
    Achievement,
    Note,
}

export type RequestResult<T> = T | string;

export function requestToResult<T>(req: AxiosResponse): RequestResult<T> {
    if (req.status == 200) {
        return req.data;
    } else {
        return req.statusText;
    }
}

export type IslandMeta = {
    id: number,
    title: string,
    subtitle: string,
    desc: string,
    date: Date,
    ty: IslandType,
    tags: TagData[],
    banner: boolean,
    wip: boolean,
    is_original: boolean,
}

export type TagData = {
    id: number,
    name: string,
    amount: number,
}

export type Island = {
    content: string,
}

export type IslandCount = {
    count: number,
}

export type MemorizeForm = {
    stu_id: string,
    name: string,

    wechat: string,
    qq: string,
    phone: string,
    email: string,

    desc: string,
    hobby: string,
    position: string,
    ftr_major: string,

    message: string,
    ip: string,
}

export type LinkExchangeData = {
    avatar: string,
    name: string,
    link: string,
    message: string,
}

export type ProjectData = {
    owner: string,
    name: string,
}

export type Bookmarks = {
    category: string,
    content: BookmarkData[],
}

export type BookmarkData = {
    title: string,
    link: string,
    comment: string,
}

export type SteamGame = {
    appid: number,
    name: string,
    playtime_2weeks: number,
    playtime_forever: number,
    img_icon_url: string,
}

export type SteamRecentlyPlayedGames = {
    totalCount: number,
    games: SteamGame[],
}

export type SteamPlayerSummaries = {
    players: [{
        lastlogoff: number,
        personastate: number,
    }]
}
