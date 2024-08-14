import MeInfo from "@/components/about/me-info";
import SelfIntro from "@/components/about/self-intro";
import ContentWrapper from "@/components/common/content-wrapper";
import DiagLines from "@/components/common/decos/diag-lines";
import EndpointDottedSegment from "@/components/common/decos/endpoint-dotted-segment";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import GiscusSection from "@/components/island/giscus";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <ContentWrapper className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="w-full md:w-72">
                        <MeInfo></MeInfo>
                    </div>
                    <SelfIntro></SelfIntro>
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <div className="font-bold">
                    <div className="flex gap-2">
                        <DiagLines scale="400%" className="w-10 h-21"></DiagLines>
                        <div className="">
                            <h2 className="text-5xl font-sh-serif">留言板</h2>
                            <h2 className="text-4xl font-bender italic font-normal">Message Board</h2>
                        </div>
                    </div>
                    <div className="flex gap-5 mt-2">
                        <div className="w-48 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
                        <div className="w-16 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
                    </div>
                    <GiscusSection className="mt-4"></GiscusSection>
                </div>
            </ContentWrapper>
        </main>
    );
}
