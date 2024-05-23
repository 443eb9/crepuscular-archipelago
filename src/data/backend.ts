const BACKEND = "http://localhost:8080/api";
const REMOTE_BACKEND = "https://443eb9.dev/api";
export const OSS = "https://oss.443eb9.dev/islandsmedia";

export function combineApi(endpoint: string) {
    return `${BACKEND}${endpoint}`
}

export function combineRemoteApi(endpoint: string) {
    // return combineApi(endpoint);
    return `${REMOTE_BACKEND}${endpoint}`
}
