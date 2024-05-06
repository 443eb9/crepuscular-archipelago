import MeInfo from "@/components/about/me-info";
import SelfIntro from "@/components/about/self-intro";
import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <ContentWrapper className="flex-col md:flex-row gap-2">
                <div className="w-full md:w-72">
                    <MeInfo></MeInfo>
                </div>
                <SelfIntro></SelfIntro>
            </ContentWrapper>
        </main>
    );
}
