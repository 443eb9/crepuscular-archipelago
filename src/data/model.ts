export type IslandType = "article" | "achievement" | "note" | "external"

export type LicenseType = "CC_BY" | "CC_BY_SA" | "CC_BY_NC" | "CC_BY_NC_SA" | "CC_BY_ND" | "CC_BY_NC_ND" | "CC0" | "Repost"

export type IslandStateType = "finished" | "workInProgress" | "longTermProject" | "deprecated" | "deleted"

export type IslandMeta = {
    id: number,
    title: string,
    subtitle: string | null,
    desc: string | null,
    date: string | null,
    ty: IslandType,
    reference: string | null,
    tags: TagData[],
    license: LicenseType,
    state: IslandStateType,
    banner: boolean,
    isEncrypted: boolean,
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

export type FoamData = {
    id: number,
    date: string,
    content: string,
    is_encrypted: boolean,
}

export type FoamCount = {
    count: number,
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
    isPublic: boolean,
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

export type SelfTitleData = {
    title: string,
    progress: number,
}
