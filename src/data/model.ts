import { AxiosResponse } from "axios";

export enum IslandType {
    Article,
    Achievement,
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

export type MemorizeFormWithMeta = {
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

    time: string,
    ip: string,
}
