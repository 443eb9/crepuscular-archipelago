import { Suspense } from "react"
import { Metadata } from "next"
import { fetchIslandMeta } from "@/data/api"
import ContentWrapper from "@/components/content-wrapper"
import ArticleContainer from "./article-container"

export default async function Page(
    props: {
        searchParams?: Promise<{
            id?: string,
            page?: string,
            len?: string,
            tags?: string,
            advf?: string,
        }>
    }
) {
    const searchParams = await props.searchParams
    const id = Number.parseInt(searchParams?.id ?? "-1")

    return (
        <ContentWrapper className="flex-col gap-5">
            <Suspense>
                <ArticleContainer id={id} params={new URLSearchParams(searchParams)}></ArticleContainer>
            </Suspense>
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
