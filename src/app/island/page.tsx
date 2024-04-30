import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { Suspense } from "react";

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
            <ContentWrapper>
                <Suspense>
                    <ArticleContainer id={id}></ArticleContainer>
                </Suspense>
            </ContentWrapper>
        </main>
    );
}
