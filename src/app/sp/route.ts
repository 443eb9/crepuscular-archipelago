import { wrappedFetch } from "@/data/api"
import { frontendEndpoint } from "@/data/endpoints"

export async function GET(request: Request) {
    const { search } = new URL(request.url)
    const target = search.substring(1)
    const targets = await wrappedFetch<{ [key: string]: number }>(frontendEndpoint("/sp-targets.json"), "GET")
    if (!targets.ok) {
        return Response.redirect(frontendEndpoint("/404"))
    }
    const targetIsland = targets.data[target]
    if (targetIsland == undefined) {
        return Response.redirect(frontendEndpoint("/404"))
    }
    return Response.redirect(frontendEndpoint(`/island/${targetIsland}`))
}
