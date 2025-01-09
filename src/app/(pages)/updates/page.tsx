import { Suspense } from "react"
import { Metadata } from "next"
import { fetchAllTags, fetchIslandCount, fetchIslandsMeta } from "@/data/api"
import BlogInfo from "./blog-info"
import NetworkErrorable from "@/components/network-errorable"
import { processQueryParams } from "@/data/utils"
import ContentWrapper from "@/components/content-wrapper"
import OutlinedBox from "@/components/outlined-box"
import IslandCard from "../(islandsView)/island-card"
import Pagination from "../(islandsView)/pagination"

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page(
    props: {
        searchParams: Promise<{
            page?: string,
            len?: string,
            tags?: string,
            advf?: string
        }>
    }
) {
    const queryParams = processQueryParams(await props.searchParams)

    const islands = await fetchIslandsMeta(queryParams.page, queryParams.len, queryParams.tags, queryParams.advf)
    const total = await fetchIslandCount(queryParams.tags, queryParams.advf)
    const allTags = await fetchAllTags()

    return (
        <main>
            <div className="flex flex-col gap-10 pr-2 md:pr-0">
                <aside className="block md:hidden px-5">
                    <NetworkErrorable resp={allTags}>
                        {data => <BlogInfo queryParams={queryParams} allTags={data} />}
                    </NetworkErrorable>
                </aside>
                <ContentWrapper className="gap-10">
                    <div className="flex flex-col gap-8 w-full">
                        <NetworkErrorable resp={islands}>
                            {data =>
                                <Suspense>
                                    <div className="flex w-full flex-col gap-10">
                                        {
                                            data.reverse().map((data, i) =>
                                                <Suspense key={i}>
                                                    <IslandCard
                                                        island={data}
                                                        key={data.id}
                                                    />
                                                </Suspense>
                                            )
                                        }
                                    </div>
                                </Suspense>
                            }
                        </NetworkErrorable>
                        <OutlinedBox className="flex gap-2 py-2 border-x-0 border-dashed">
                            <NetworkErrorable resp={total}>
                                {data =>
                                    <Pagination total={Math.ceil(data.count / queryParams.len)} current={queryParams.page} />
                                }
                            </NetworkErrorable>
                        </OutlinedBox>
                    </div>
                    <aside className="hidden md:flex w-full max-w-72">
                        <div className="fixed max-w-72 md:flex md:flex-col gap-5">
                            <NetworkErrorable resp={allTags}>
                                {data => <BlogInfo queryParams={queryParams} allTags={data} />}
                            </NetworkErrorable>
                        </div>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    )
}
