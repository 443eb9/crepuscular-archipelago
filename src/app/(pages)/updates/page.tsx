import BlogInfo from "@/components/updates/blog-info"
import ContentWrapper from "@/components/common/content-wrapper"
import BlogIslands from "@/components/updates/blog-islands"
import { Suspense } from "react"
import { Metadata } from "next"
import { fetchIslandCount, fetchIslandsMeta } from "@/data/api"
import PageSwitcher from "@/components/updates/page-switcher"
import NetworkErrorable from "@/components/common/network-error-fallback"

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page(
    props: {
        searchParams?: Promise<{
            page?: string,
            len?: string,
            tags?: string,
            advf?: string
        }>
    }
) {
    const searchParams = await props.searchParams
    const page = parseInt(searchParams?.page ?? "0")
    const length = parseInt(searchParams?.len ?? "10")
    const tagsFilter = parseInt(searchParams?.tags ?? "0")
    const advancedFilter = parseInt(searchParams?.advf ?? "0")

    const islands = await fetchIslandsMeta(page, length, tagsFilter, advancedFilter)
    const total = await fetchIslandCount(tagsFilter, advancedFilter)
    const params = new URLSearchParams(searchParams)

    return (
        <main>
            <div className="flex flex-col gap-10 pr-2 md:pr-0">
                <aside className="block md:hidden px-5">
                    <Suspense>
                        <BlogInfo></BlogInfo>
                    </Suspense>
                </aside>
                <ContentWrapper className="gap-10">
                    <div className="flex flex-col gap-8 w-full">
                        <NetworkErrorable resp={islands}>
                            {data =>
                                <Suspense>
                                    <BlogIslands islands={data} params={params}></BlogIslands>
                                </Suspense>
                            }
                        </NetworkErrorable>
                        <NetworkErrorable resp={total}>
                            {data=>
                                <PageSwitcher islandCount={data.count} currentPage={page} currentLength={length}></PageSwitcher>
                            }
                        </NetworkErrorable>
                    </div>
                    <aside className="hidden md:flex w-full max-w-72">
                        <div className="fixed max-w-72 md:flex md:flex-col gap-5">
                            <Suspense>
                                <BlogInfo></BlogInfo>
                            </Suspense>
                        </div>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    )
}
