import { Vector2 } from "three";
import { OSS } from "./backend"

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
