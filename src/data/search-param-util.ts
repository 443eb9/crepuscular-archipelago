import { ReadonlyURLSearchParams } from "next/navigation"

export function searchParamBitXor(bit: number, param: string, ro: ReadonlyURLSearchParams | URLSearchParams) {
    const params = new URLSearchParams(ro)
    const filter = parseInt(ro.get(param) ?? "0")
    const tags = filter ^ (1 << bit)
    params.set(param, tags.toString())
    return params
}

export function searchParamBitSet(bit: number, value: boolean, param: string, ro: ReadonlyURLSearchParams | URLSearchParams) {
    const params = new URLSearchParams(ro)
    const filter = parseInt(ro.get(param) ?? "0")
    const tags = value ? filter | (1 << bit) : filter & (~(1 << bit))
    params.set(param, tags.toString())
    return params
}

export function searchParamBitGet(bit: number, param: string, ro: ReadonlyURLSearchParams | URLSearchParams) {
    return (parseInt(ro.get(param) ?? "0") & (1 << bit)) != 0
}

export function searchParamReset(param: Array<string>, ro: ReadonlyURLSearchParams | URLSearchParams) {
    const params = new URLSearchParams(ro)
    param.forEach((v, _) => params.delete(v))
    return params
}

export function searchParamToString(params: URLSearchParams) {
    const arr = Array.from(params)
    if (arr.length == 0) {
        return ""
    } else {
        const s = arr.map(([k, v], _) => `${k}=${v}&`).reduce((acc, cur) => acc + cur)
        return s.substring(0, s.length - 1)
    }
}
