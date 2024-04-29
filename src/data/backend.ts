const BACKEND = "http://localhost:8080/api";

export function combineApi(endpoint: string) {
    return `${BACKEND}${endpoint}`
}
