export enum IslandType {
    Article,
    Achievement,
}

export type IslandMeta = {
    id: number,
    title: string,
    desc: string,
    date: Date,
    ty: IslandType,
}

export type TagData = {
    id: number,
    name: string,
    amount: number,
}

export type Island = {
    content: string,
}