import ArticleContainer from "@/components/island/article-container";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <div className="flex justify-center">
                <ContentWrapper>
                    <ArticleContainer></ArticleContainer>
                </ContentWrapper>
            </div>
        </main>
    );
}
