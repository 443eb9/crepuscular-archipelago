import { ReadonlyURLSearchParams } from "next/navigation";

export function searchParamBitXor(bit: number, param: string, ro: ReadonlyURLSearchParams) {
    const filter = parseInt(ro.get(param) ?? "0");
    const tags = filter ^ (1 << bit);
    const params = new URLSearchParams(ro);
    params.set(param, tags.toString());
    return params.toString();
}

export function searchParamBitSet(bit: number, value: boolean, param: string, ro: ReadonlyURLSearchParams) {
    const filter = parseInt(ro.get(param) ?? "0");
    const tags = value ? filter | (1 << bit) : filter & (~(1 << bit));
    const params = new URLSearchParams(ro);
    params.set(param, tags.toString());
    return params.toString();
}

export function searchParamBitGet(bit: number, param: string, ro: ReadonlyURLSearchParams) {
    return (parseInt(ro.get(param) ?? "0") & (1 << bit)) != 0
}
