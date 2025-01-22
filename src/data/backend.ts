const production = process.env.NODE_ENV == "production"
const FRONTEND = production ? "https://443eb9.dev" : "http://localhost:3000"
const API_BACKEND = production ? "https://443eb9.dev/api" : "http://localhost:8080/api"
export const OSS = "https://oss.443eb9.dev/islandsmedia"

export function frontendEndpoint(path: string) {
    return `${FRONTEND}${path}`
}

export function apiEndpoint(endpoint: string) {
    return `${API_BACKEND}${endpoint}`
}
