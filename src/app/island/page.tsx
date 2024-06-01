import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchIslandMeta } from "@/data/island";
import Footer from "@/components/common/footer";

export default function Page({ searchParams }: {
    searchParams?: {
        id?: string,
    }
}) {
    const id = Number.parseInt(searchParams?.id ?? "-1");

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <ContentWrapper className="flex-col gap-5">
                <Suspense>
                    <ArticleContainer id={id}></ArticleContainer>
                </Suspense>
                <Footer></Footer>
            </ContentWrapper>
        </main>
    );
}

export async function generateMetadata({ searchParams }: {
    searchParams?: {
        id?: string,
    }
}): Promise<Metadata> {
    const id = Number.parseInt(searchParams?.id ?? "-1");

    const meta = (await fetchIslandMeta(id)).data;

    return {
        title: `${meta.title} - Crepuscular Archipelago`
    }
}
