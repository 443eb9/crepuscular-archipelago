import { fetchIslandsMeta } from "@/data/api"
import { searchParamsToQueryParams } from "@/data/search-param-util"
import RSS from "rss"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const params = searchParamsToQueryParams(searchParams)

    const feed = new RSS({
        title: "晨暮群岛 Crepuscular Archipelago",
        description: "不为人知的岛屿群，欢迎来玩~ ♪(´▽｀)",
        feed_url: "https://443eb9.dev/rss",
        site_url: "https://443eb9.dev/",
        managingEditor: "443eb9@gmail.com",
        webMaster: "443eb9@gmail.com",
    })

    const wip = searchParams.get("wip")
    const blogs = await fetchIslandsMeta(0, params.len, params.tags, params.advf)
    if (blogs.ok) {
        blogs.data.reverse().forEach(island => {
            const title = island.subtitle ? `${island.title} - ${island.subtitle}` : island.title
            const isWip = island.date ? "" : "[WIP] "

            if (island.date != undefined || wip != "0") {
                if (island.isDeleted) {
                    feed.item({
                        title: `${island.id} Access Denied`,
                        description: "N/A",
                        url: "https://443eb9.dev/updates",
                        date: island.date ? island.date : "",
                    })
                } else {
                    feed.item({
                        title: isWip + title,
                        description: island.desc ?? "[No description.]",
                        url: island.ty == "article" ? `https://443eb9.dev/island?id=${island.id}` : "https://443eb9.dev/updates",
                        date: island.date ? island.date : "",
                        categories: [island.ty],
                    })
                }
            }
        })
    }

    return new Response(feed.xml({ indent: true }), {
        headers: {
            "Content-Type": "application/xml charset=utf-8"
        },
    })
}
