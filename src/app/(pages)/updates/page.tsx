import { Suspense } from "react"
import { Metadata } from "next"
import { fetchAllTags, fetchIslandCount, fetchIslandsMeta } from "@/data/api"
import BlogInfo from "./blog-info"
import NetworkErrorable from "@/components/network-errorable"
import { processQueryParams, RawSearchParams } from "@/data/utils"
import ContentWrapper from "@/components/content-wrapper"
import OutlinedBox from "@/components/outlined-box"
import IslandCard from "../(islandsView)/island-card"
import Pagination from "../(islandsView)/pagination"
import Link from "next/link"
import Text from "@/components/text"

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
                        {data => <OutlinedBox><BlogInfo queryParams={queryParams} allTags={data} /></OutlinedBox>}
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
                                            : data.reverse().map((data, i) => <IslandCard island={data} key={i} />)
                                    }
                                </div>
                            }
                        </NetworkErrorable>
                        <NetworkErrorable resp={total}>
                            {data =>
                                data.count > 0 &&
                                <OutlinedBox className="flex gap-2 py-2 border-x-0 border-dashed">
                                    <Pagination total={Math.ceil(data.count / queryParams.len)} current={queryParams.page} />
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
                                            <BlogInfo queryParams={queryParams} allTags={data} />
                                        </OutlinedBox>
                                        <OutlinedBox className="p-2">
                                            <div className="italic font-bender font-bold">
                                                RSS Feed: <Link href={"https://443eb9.dev/rss"} className="underline">https://443eb9.dev/rss</Link>
                                            </div>
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
