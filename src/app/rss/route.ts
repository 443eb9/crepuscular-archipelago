import { fetchIslandsMeta } from "@/data/api"
import { IslandType } from "@/data/model"
import RSS from "rss"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const len = parseInt(searchParams.get("len") ?? "10")
    const wip = parseInt(searchParams.get("wip") ?? "1")
    const tags = parseInt(searchParams.get("tags") ?? "0")
    const advf = parseInt(searchParams.get("advf") ?? "0")

    const feed = new RSS({
        title: "晨暮群岛 Crepuscular Archipelago",
        description: "不为人知的岛屿群，欢迎来玩~ ♪(´▽｀)",
        feed_url: "https://443eb9.dev/rss.xml",
        site_url: "https://443eb9.dev/",
        managingEditor: "443eb9@gmail.com",
        webMaster: "443eb9@gmail.com",
    })

    const blogs = await fetchIslandsMeta(0, len, tags, advf)
    if (blogs.ok) {
        blogs.data.reverse().forEach(island => {
            const title = island.subtitle ? `${island.title} - ${island.subtitle}` : island.title
            const isWip = island.date ? "" : "[WIP] "

            if (!isWip || wip != 0)
                feed.item({
                    title: isWip + title,
                    description: island.desc,
                    url: island.ty == IslandType.Article ? `https://443eb9.dev/island?id=${island.id}` : "https://443eb9.dev/updates",
                    date: island.date ? island.date : "",
                    categories: [IslandType[island.ty]]
                })
        })
    }

    return new Response(feed.xml({ indent: true }), {
        headers: {
            "Content-Type": "application/xml charset=utf-8"
        },
    })
}
