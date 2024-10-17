import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchIslandMeta } from "@/data/api";
import { ErrorResponse } from "@/data/requests";

export default function Page({ searchParams }: {
    searchParams?: {
        id?: string,
        page?: string,
        len?: string,
        tags?: string,
        advf?: string,
    }
}) {
    const id = Number.parseInt(searchParams?.id ?? "-1");

    return (
        <ContentWrapper className="flex-col gap-5">
            <Suspense>
                <ArticleContainer id={id} params={new URLSearchParams(searchParams)}></ArticleContainer>
            </Suspense>
        </ContentWrapper>
    );
}

export async function generateMetadata({ searchParams }: {
    searchParams?: {
        id?: string,
    }
}): Promise<Metadata> {
    const id = Number.parseInt(searchParams?.id ?? "-1");

    const meta = await fetchIslandMeta(id);

    let title;
    if (meta instanceof ErrorResponse) {
        title = "Undefined Coordinate";
    } else {
        title = meta.data.title;
    }

    return {
        title: `${title} - Crepuscular Archipelago`
    }
}
