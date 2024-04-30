'use client';

import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? "-1";

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <ContentWrapper>
                <Suspense>
                    <ArticleContainer id={Number.parseInt(id)}></ArticleContainer>
                </Suspense>
            </ContentWrapper>
        </main>
    );
}
