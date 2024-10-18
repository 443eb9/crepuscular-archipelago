import { fetchIslandsMeta } from "@/data/api";
import { IslandType } from "@/data/model";
import { ErrorResponse } from "@/data/requests";
import RSS from "rss";

export async function GET() {
    const feed = new RSS({
        title: "晨暮群岛 Crepuscular Archipelago",
        description: "不为人知的岛屿群，欢迎来玩~ ♪(´▽｀)",
        feed_url: "https://443eb9.dev/rss.xml",
        site_url: "https://443eb9.dev/",
        managingEditor: "443eb9@gmail.com",
        webMaster: "443eb9@gmail.com",
    });

    const blogs = await fetchIslandsMeta(0, 10, 0, 0);
    if (!(blogs instanceof ErrorResponse)) {
        blogs.data.reverse().forEach(island => {
            const title = island.subtitle.length == 0 ? island.title : `${island.title} - ${island.subtitle}`;
            const wip = island.wip ? "[WIP] " : "";
            feed.item({
                title: wip + title,
                description: island.desc,
                url: island.ty == IslandType.Article ? `https://443eb9.dev/island?id=${island.id}` : "https://443eb9.dev/updates",
                date: island.date,
                categories: [IslandType[island.ty]]
            });
        });
    }

    return new Response(feed.xml({ indent: true }), {
        headers: {
            "Content-Type": "application/xml; charset=utf-8"
        },
    });
}
