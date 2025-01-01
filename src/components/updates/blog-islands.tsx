import { fetchIsland } from "@/data/api"
import IslandCard from "./island-card"
import { Suspense } from "react"
import { IslandMeta, IslandType } from "@/data/model"
import NetworkErrorable from "../common/network-error-fallback"
import MarkdownContainer from "../common/markdown-container"

export default async function BlogIslands({ islands, params }: { islands: IslandMeta[], params: URLSearchParams }) {
    let maybeContents = new Array(islands.length).fill('')
    for (let i = 0; i < islands.length; i++) {
        if (islands[i].ty == IslandType.Note) {
            // I know this is slow
            // But I'm lazy :p
            const response = await fetchIsland(islands[i].id)
            maybeContents[i] = <NetworkErrorable resp={response}>
                {data =>
                    <MarkdownContainer body={data.content} />
                }
            </NetworkErrorable>
        }
    }

    return (
        <div className="flex w-full flex-col gap-10">
            {
                islands.reverse().map((data, i) =>
                    <Suspense key={i}>
                        <IslandCard
                            island={data}
                            key={data.id}
                            content={data.ty == IslandType.Note ? maybeContents[islands.length - 1 - i] : undefined}
                            params={params}
                        ></IslandCard>
                    </Suspense>
                )
            }
        </div>
    )
}
