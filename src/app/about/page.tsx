import MeInfo from "@/components/about/me-info";
import SelfIntro from "@/components/about/self-intro";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/nav/global-nav-bar";

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <div className="flex justify-center">
                <ContentWrapper className="flex-col md:flex-row gap-2">
                    <div className="w-full md:w-72">
                        <MeInfo></MeInfo>
                    </div>
                    <SelfIntro></SelfIntro>
                </ContentWrapper>
            </div>
        </main>
    );
}
