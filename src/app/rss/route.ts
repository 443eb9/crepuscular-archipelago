import { fetchIslandsMeta } from "@/data/api"
import { IslandMeta } from "@/data/model"
import { processUrlSearchParams } from "@/data/search-param-util"
import RSS from "rss"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const params = processUrlSearchParams(searchParams)

    const feed = new RSS({
        title: "晨暮群岛 Crepuscular Archipelago",
        description: "不为人知的岛屿群，欢迎来玩~ ♪(´▽｀)",
        feed_url: "https://443eb9.dev/rss",
        site_url: "https://443eb9.dev/",
        managingEditor: "443eb9@gmail.com",
        webMaster: "443eb9@gmail.com",
    })

    const getUrl = (island: IslandMeta) => {
        switch (island.ty) {
            case "article":
                return `https://443eb9.dev/island/${island.id}`
            case "achievement":
            case "note":
                return "https://443eb9.dev/updates"
            case "external":
                return island.reference!
        }
    }

    const blogs = await fetchIslandsMeta(0, params.len, params.tags, params.advf)
    if (blogs.ok) {
        blogs.data.reverse().forEach(island => {
            let title = island.subtitle ? `${island.title} - ${island.subtitle}` : island.title
            if (island.ty == "external") {
                title = "[EXTERNAL] " + title
            }

            feed.item({
                title: title,
                description: island.desc ?? "N/A",
                url: getUrl(island),
                date: island.date ? island.date : "",
                categories: [island.ty, island.state],
            })
        })
    }

    return new Response(feed.xml({ indent: true }), {
        headers: {
            "Content-Type": "application/xml charset=utf-8"
        },
    })
}
