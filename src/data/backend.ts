const BACKEND = "http://localhost:8080/api";
export const OSS = "https://oss.443eb9.dev/islandsmedia"

export function combineApi(endpoint: string) {
    return `${BACKEND}${endpoint}`
}
