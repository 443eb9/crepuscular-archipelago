import { Metadata } from "next"
import { fetchIsland, fetchIslandMeta } from "@/data/api"
import ContentWrapper from "@/components/content-wrapper"
import ArticleContainer from "../article-container"
import NetworkErrorable from "@/components/network-errorable"
import { processQueryParams, RawSearchParams } from "@/data/search-param-util"

export default async function Page({ searchParams, params }: { searchParams: Promise<RawSearchParams>, params: Promise<{ id: string }> }) {
    const queryParams = processQueryParams(await searchParams)
    const id = Number.parseInt((await params).id)
    const meta = await fetchIslandMeta(id)
    const content = await fetchIsland(id)

    return (
        <ContentWrapper className="flex-col gap-5">
            <NetworkErrorable resp={meta}>
                {
                    meta => <NetworkErrorable resp={content}>
                        {
                            content =>
                                <ArticleContainer
                                    meta={meta}
                                    content={content.content}
                                    params={queryParams}
                                />
                        }
                    </NetworkErrorable>
                }
            </NetworkErrorable>
        </ContentWrapper>
    )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = Number.parseInt((await params).id)
    const meta = await fetchIslandMeta(id)
    const title = meta.ok ? meta.data.title : "Undefined Coordinate"

    console.log("AAAAAAAAAAAA")
    return {
        title: `${title} - Crepuscular Archipelago`
    }
}
