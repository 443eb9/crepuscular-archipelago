const BACKEND = "http://localhost:8080/api"
const REMOTE_BACKEND = "https://443eb9.dev/api"
export const OSS = "https://oss.443eb9.dev/islandsmedia"

const env = process.env.NODE_ENV

export function combineApi(endpoint: string) {
    return `${BACKEND}${endpoint}`
}

export function combineRemoteApi(endpoint: string) {
    if (env == "production") {
        return `${REMOTE_BACKEND}${endpoint}`
    } else {
        return `${BACKEND}${endpoint}`
    }
}
