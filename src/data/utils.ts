import { Vector2 } from "three";
import { OSS } from "./endpoints"
import { createDecipheriv } from "crypto";

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
