import { OSS } from "./endpoints"
import { createDecipheriv } from "crypto";
import { IslandStateType, IslandType, LicenseType } from "./model";

export function formatDate(date: string | undefined) {
    if (!date) {
        return "未来"
    }
    const d = new Date(date)
    return `${d.getFullYear()}/${d.getMonth()}/${d.getDay()}`
}

export function formatState(ty: IslandType, state: IslandStateType) {
    if (ty == "external") return "External"

    switch (state) {
        case "deleted": return "Deleted"
        case "workInProgress": return "Work In Progress"
        case "finished": return "Finished"
        case "longTermProject": return "Long-Term Project"
        case "deprecated": return "Deprecated"
    }
}

export function formatLicense(license: LicenseType): ("by" | "cc" | "nc" | "nd" | "sa" | "zero")[] {
    switch (license) {
        case "CC_BY": return ["cc", "by"]
        case "CC_BY_SA": return ["cc", "by", "sa"]
        case "CC_BY_NC": return ["cc", "by", "nc"]
        case "CC_BY_NC_SA": return ["cc", "by", "nc", "sa"]
        case "CC_BY_ND": return ["cc", "by", "nd"]
        case "CC_BY_NC_ND": return ["cc", "by", "nc", "nd"]
        case "CC0": return ["zero"]
        case "Repost": return []
    }
}

export function bannerUrl(id: number) {
    return `${OSS}/${id}/BANNER.png`
}

export function lerp(x: number, y: number, t: number) {
    return x * (1 - t) + y * t
}

export type StatefulContext<T> = {
    value: T,
    setter: (value: T) => void,
}

export function findClassNameAmong(target: HTMLElement, className: string): boolean {
    while (!target.classList.contains(className)) {
        if (target.parentElement == null) {
            return false
        } else {
            target = target.parentElement
        }
    }
    return true
}

export function extractBits(bits: number): number[] {
    let x = 0
    let res = []
    while (bits) {
        if ((bits & 1) != 0) {
            res.push(x)
        }
        bits = bits >> 1
        x++
    }
    return res
}

export function setBit(x: number, b: number, state: boolean) {
    if (state) return enableBit(x, b)
    else return disableBit(x, b)
}

export function enableBit(x: number, b: number) {
    return x | (1 << b)
}

export function disableBit(x: number, b: number) {
    return x & ~(1 << b)
}

export function bitEnabled(x: number, b: number) {
    return (x & (1 << b)) != 0
}

export function toggleBit(x: number, b: number) {
    return x ^ (1 << b)
}

export function decrypt(body: string, key: string, iv: string) {
    const keyBuf = Buffer.from(key)
    const ivBuf = Buffer.from(iv)
    const content = Buffer.from(body, "base64")
    const data = content.subarray(0, content.length - 16)
    const authTag = content.subarray(content.length - 16)

    const decipher = createDecipheriv("aes-256-gcm", keyBuf, ivBuf)
    decipher.setAuthTag(authTag)
    return decipher.update(data, undefined, "utf8") + decipher.final("utf8")
}

export type AdvancedFilterType = "invert" | "tag-or-logic" | "exclude-finished" | "exclude-wip" | "exclude-ltp" | "exclude-deprecated" | "exclude-deleted"

export function advancedFilterEnabled(filter: number, ty: AdvancedFilterType) {
    switch (ty) {
        case "invert": return bitEnabled(filter, 1)
        case "tag-or-logic": return bitEnabled(filter, 2)
        case "exclude-finished": return bitEnabled(filter, 3)
        case "exclude-wip": return bitEnabled(filter, 4)
        case "exclude-ltp": return bitEnabled(filter, 5)
        case "exclude-deprecated": return bitEnabled(filter, 6)
        case "exclude-deleted": return bitEnabled(filter, 7)
    }
}

export function toggleAdvancedFilter(filter: number, ty: AdvancedFilterType) {
    switch (ty) {
        case "invert": return toggleBit(filter, 1)
        case "tag-or-logic": return toggleBit(filter, 2)
        case "exclude-finished": return toggleBit(filter, 3)
        case "exclude-wip": return toggleBit(filter, 4)
        case "exclude-ltp": return toggleBit(filter, 5)
        case "exclude-deprecated": return toggleBit(filter, 6)
        case "exclude-deleted": return toggleBit(filter, 7)
    }
}

export function setAdvancedFilter(filter: number, ty: AdvancedFilterType, state: boolean) {
    switch (ty) {
        case "invert": return setBit(filter, 1, state)
        case "tag-or-logic": return setBit(filter, 2, state)
        case "exclude-finished": return setBit(filter, 3, state)
        case "exclude-wip": return setBit(filter, 4, state)
        case "exclude-ltp": return setBit(filter, 5, state)
        case "exclude-deprecated": return setBit(filter, 6, state)
        case "exclude-deleted": return setBit(filter, 7, state)
    }
}

export function constructPath(pathname: string, params: URLSearchParams) {
    return params.size == 0
        ? pathname
        : `${pathname}?${params.toString()}`
}
