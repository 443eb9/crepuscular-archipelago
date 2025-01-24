export type IslandType = "article" | "achievement" | "note"

export type IslandMeta = {
    id: number,
    title: string,
    subtitle: string | undefined,
    desc: string,
    date: Date | undefined,
    ty: IslandType,
    tags: TagData[],
    banner: boolean,
    isOriginal: boolean,
    isEncrypted: boolean,
    isDeleted: boolean,
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
    stuId: string,
    name: string,

    wechat: string,
    qq: string,
    phone: string,
    email: string,

    desc: string,
    hobby: string,
    position: string,
    ftrMajor: string,

    message: string,
    ip: string,
}

export type FriendDialogData = {
    expression: string,
    content: string,
    customHtml?: string,
}

export type LinkExchangeData = {
    avatar: string,
    name: string,
    link: string,
    message: string,
    dialog?: FriendDialogData[],
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

export type IslandMap = {
    width: number,
    height: number,
    data: Uint8Array,
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

export type IslandMapQuery = {
    regionId: number,
    noiseValue: number,
}

export type IslandMapQueryResult = {
    result: IslandMapQuery | null,
}

export type IslandMapMeta = {
    size: number,
    perPageRegions: number,
    pageCnt: number,
}

export type IslandMapRegionCenters = [number, number][]

export type ArtworkMeta = {
    name: string,
    author: string,
    src: string,
}
