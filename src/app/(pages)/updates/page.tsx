import { Suspense } from "react"
import { Metadata } from "next"
import { fetchAllTags, fetchIsland, fetchIslandCount, fetchIslandsMeta } from "@/data/api"
import IslandFilter from "../../../components/island-filter"
import NetworkErrorable from "@/components/network-errorable"
import ContentWrapper from "@/components/content-wrapper"
import OutlinedBox from "@/components/outlined-box"
import IslandCard from "../../../components/card/island-card"
import Pagination from "../../../components/pagination"
import Link from "next/link"
import Text from "@/components/text"
import { processQueryParams, RawSearchParams } from "@/data/search-param-util"
import { frontendEndpoint } from "@/data/backend"

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page(props: { searchParams: Promise<RawSearchParams> }) {
    const queryParams = processQueryParams(await props.searchParams)

    const islands = await fetchIslandsMeta(queryParams.page, queryParams.len, queryParams.tags, queryParams.advf)
    const total = await fetchIslandCount(queryParams.tags, queryParams.advf)
    const allTags = await fetchAllTags()

    return (
        <main>
            <div className="flex flex-col gap-10 pr-2 md:pr-0">
                <aside className="block md:hidden px-5">
                    <NetworkErrorable resp={allTags}>
                        {data => <OutlinedBox><IslandFilter params={queryParams} allTags={data} /></OutlinedBox>}
                    </NetworkErrorable>
                </aside>
                <ContentWrapper className="gap-10">
                    <div className="flex flex-col gap-8 w-full">
                        <NetworkErrorable resp={islands}>
                            {data =>
                                <div className="flex w-full flex-col gap-10">
                                    {
                                        data.length == 0
                                            ? <Text className="font-bender font-bold italic">Void</Text>
                                            : <Suspense>
                                                {
                                                    Promise.all(data.reverse().map(async (island, i) => {
                                                        switch (island.ty) {
                                                            case "article":
                                                                return <IslandCard island={island} key={i} params={queryParams} />
                                                            case "achievement":
                                                                return <IslandCard island={island} key={i} params={queryParams} />
                                                            case "note":
                                                                return <NetworkErrorable resp={await fetchIsland(island.id)}>
                                                                    {content => <IslandCard island={island} key={i} content={content.content} params={queryParams} />}
                                                                </NetworkErrorable>
                                                        }
                                                    }))
                                                }
                                            </Suspense>
                                    }
                                </div>
                            }
                        </NetworkErrorable>
                        <NetworkErrorable resp={total}>
                            {data =>
                                data.count > 0 &&
                                <OutlinedBox className="flex gap-2 py-2 border-x-0 border-dashed">
                                    <Pagination total={Math.ceil(data.count / queryParams.len)} current={queryParams.page} buttonSize={48} params={queryParams} />
                                </OutlinedBox>
                            }
                        </NetworkErrorable>
                    </div>
                    <aside className="hidden md:flex w-full max-w-72">
                        <div className="fixed max-w-72 md:flex md:flex-col gap-5">
                            <NetworkErrorable resp={allTags}>
                                {data =>
                                    <>
                                        <OutlinedBox>
                                            <IslandFilter params={queryParams} allTags={data} />
                                        </OutlinedBox>
                                        <OutlinedBox className="p-2">
                                            <Text className="italic font-bender font-bold" noFont>
                                                RSS Feed: <Link href={frontendEndpoint("/rss")} className="underline">https://443eb9.dev/rss</Link>
                                            </Text>
                                        </OutlinedBox>
                                    </>
                                }
                            </NetworkErrorable>
                        </div>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    )
}
