import { Metadata } from "next"
import { fetchIsland, fetchIslandMeta } from "@/data/api"
import ContentWrapper from "@/components/content-wrapper"
import ArticleContainer from "../article-container"
import NetworkErrorable from "@/components/network-errorable"
import { processQueryParams, RawSearchParams } from "@/data/search-param-util"
import { OSS } from "@/data/endpoints"

export default async function Page({ searchParams, params }: { searchParams: Promise<RawSearchParams>, params: Promise<{ id: string }> }) {
    const queryParams = processQueryParams(await searchParams)
    const id = Number.parseInt((await params).id)
    const meta = await fetchIslandMeta(id)
    const content = await fetchIsland(id)

    return (
        <NetworkErrorable resp={meta}>
            {
                meta =>
                    <>
                        {
                            meta.background &&
                            <div className="fixed w-[100vw] h-[100vh] bg-cover bg-center -z-[1000] blur-md opacity-20" style={{ backgroundImage: `url("${OSS}/${meta.id}/BACKGROUND.png")` }} />
                        }
                        <ContentWrapper className="flex-col gap-5">
                            <NetworkErrorable resp={content}>
                                {
                                    content =>
                                        <ArticleContainer
                                            meta={meta}
                                            content={content.content}
                                            params={queryParams}
                                        />
                                }
                            </NetworkErrorable>
                        </ContentWrapper>
                    </>
            }
        </NetworkErrorable>
    )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = Number.parseInt((await params).id)
    const meta = await fetchIslandMeta(id)
    const title = meta.ok ? meta.data.title : "Undefined Coordinate"
    return {
        title: `${title} - Crepuscular Archipelago`
    }
}
