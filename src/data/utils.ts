import { Vector2 } from "three";
import { OSS } from "./backend"

export type RawSearchParams = {
    page?: string,
    len?: string,
    tags?: string,
    advf?: string,
}

export type QueryParams = {
    page: number,
    len: number,
    tags: number,
    advf: number,
}

export function processQueryParams(params: RawSearchParams): QueryParams {
    const page = parseInt(params?.page ?? "0")
    const len = parseInt(params?.len ?? "10")
    const tags = parseInt(params?.tags ?? "0")
    const advf = parseInt(params?.advf ?? "0")
    return { page, len, tags, advf }
}

export function queryParamsToSearchParams(params: QueryParams) {
    return new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v.toString()]))
}

export function formatDate(date: string | undefined) {
    if (!date) {
        return "未来"
    }
    const d = new Date(date)
    return `${d.getFullYear()}/${d.getMonth()}/${d.getDay()}`
}

export function bannerUrl(id: number) {
    return `${OSS}/${id}/BANNER.png`
}

export function lerp(x: number, y: number, t: number) {
    return x * (1 - t) + y * t
}

export type Transform = {
    translation: Vector2,
    scale: number,
}
