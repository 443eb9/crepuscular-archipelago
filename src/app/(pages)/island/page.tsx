import { Metadata } from "next"
import { fetchIsland, fetchIslandMeta } from "@/data/api"
import ContentWrapper from "@/components/content-wrapper"
import ArticleContainer from "./article-container"
import NetworkErrorable from "@/components/network-errorable"
import { processQueryParams, RawSearchParams } from "@/data/search-param-util"

export default async function Page(props: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await props.searchParams)
    const id = params.id ?? -1
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
                                    params={params}
                                />
                        }
                    </NetworkErrorable>
                }
            </NetworkErrorable>
        </ContentWrapper>
    )
}

export async function generateMetadata(
    props: {
        searchParams?: Promise<{
            id?: string,
        }>
    }
): Promise<Metadata> {
    const searchParams = await props.searchParams
    const id = Number.parseInt(searchParams?.id ?? "-1")

    const meta = await fetchIslandMeta(id)

    let title
    if (meta.ok) {
        title = meta.data.title
    } else {
        title = "Undefined Coordinate"
    }

    return {
        title: `${title} - Crepuscular Archipelago`
    }
}
