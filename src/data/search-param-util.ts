export type RawSearchParams = {
    id?: string,
    page?: string,
    len?: string,
    tags?: string,
    advf?: string,
}

export type QueryParams = {
    id?: number,
    page: number,
    len: number,
    tags: number,
    advf: number,
}

const DefaultQueryParams: QueryParams = {
    id: undefined,
    page: 0,
    len: 10,
    tags: 0,
    advf: 0,
}

function extractParam<T>(params: URLSearchParams, name: string, process?: (value: string) => T): T | undefined {
    const elem = params.get(name)
    return elem ? process ? process(elem) : elem as T : undefined
}

export function searchParamsToQueryParams(params: URLSearchParams): QueryParams {
    const id = extractParam(params, "id", parseInt)
    const page = extractParam(params, "page", parseInt) ?? DefaultQueryParams.page
    const len = extractParam(params, "len", parseInt) ?? DefaultQueryParams.len
    const tags = extractParam(params, "tags", parseInt) ?? DefaultQueryParams.tags
    const advf = extractParam(params, "advf", parseInt) ?? DefaultQueryParams.advf
    return { id, page, len, tags, advf }
}

export function processQueryParams(params: RawSearchParams): QueryParams {
    const id = params.id ? parseInt(params.id) : undefined
    const page = parseInt(params.page ?? "0")
    const len = parseInt(params.len ?? "10")
    const tags = parseInt(params.tags ?? "0")
    const advf = parseInt(params.advf ?? "0")
    return { id, page, len, tags, advf }
}

export function queryParamsToSearchParams(params: QueryParams) {
    const defaultValues = DefaultQueryParams as { [key: string]: any }

    return new URLSearchParams(
        Object
            .entries(params)
            .map(([k, v]) => defaultValues[k] == v ? undefined : [k, v.toString()])
            .filter(x => x != undefined)
    )
}
