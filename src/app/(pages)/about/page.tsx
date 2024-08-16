import AboutSection from "@/components/about/about-section";
import LinkExchange from "@/components/about/link-exchange";
import MeInfo from "@/components/about/me-info";
import Projects from "@/components/about/projects";
import SelfIntro from "@/components/about/self-intro";
import ContentWrapper from "@/components/common/content-wrapper";
import EndpointDottedSegment from "@/components/common/decos/endpoint-dotted-segment";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import OutlinedBox from "@/components/common/outlined-box";
import GiscusSection from "@/components/island/giscus";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default async function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            <ContentWrapper className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col gap-2 w-full md:w-72">
                        <MeInfo></MeInfo>
                        <OutlinedBox className="font-sh-sans text-light-dark-neutral italic text-large p-2 border-dashed">
                            <div>期待这边多出来一个 米画师 图标的一天</div>
                            <div className="text-right">——2024.8.15留</div>
                        </OutlinedBox>
                    </div>
                    <SelfIntro></SelfIntro>
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="友链" enTitle="Link Exchange">
                    <div className="font-sh-sans italic text-light-dark-neutral">
                        想加上自己的可以来<Link href={"https://github.com/443eb9/aetheric-cargo"}><u>这里</u></Link> ヾ(≧▽≦*)o
                    </div>
                    <Suspense>
                        <LinkExchange></LinkExchange>
                    </Suspense>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="一些项目" enTitle="Projects">
                    <Suspense>
                        <Projects></Projects>
                    </Suspense>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="留言板" enTitle="Message Board">
                    <GiscusSection className="mt-4"></GiscusSection>
                </AboutSection>
            </ContentWrapper>
        </main>
    );
}
