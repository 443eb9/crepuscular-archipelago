'use client';

import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? "-1";

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <div className="flex justify-center">
                <ContentWrapper className="flex flex-col gap-5">
                    <ArticleContainer id={Number.parseInt(id)}></ArticleContainer>
                </ContentWrapper>
            </div>
        </main>
    );
}
