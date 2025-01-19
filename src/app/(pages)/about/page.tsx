import ContentWrapper from "@/components/content-wrapper"
import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import MeInfo from "./me-info"
import OutlinedBox from "@/components/outlined-box"
import EndpointDottedSegment from "@/components/decos/endpoint-dotted-segment"
import AboutSection from "./about-section"
import LinkExchange from "./link-exchange"
import Projects from "./projects"
import GiscusSection from "@/components/giscus-section"
import Text from "@/components/text"
import { wrappedGet } from "@/data/api"
import NetworkErrorable from "@/components/network-errorable"
import Markdown from "@/components/markdown"
import { backendEndpoint } from "@/data/backend"

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default async function Page() {
    const selfIntro = await wrappedGet<string>(backendEndpoint("/self-intro.md"))

    return (
        <main>
            <ContentWrapper className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col gap-2 w-full md:w-72">
                        <MeInfo></MeInfo>
                        <OutlinedBox className="font-sh-sans text-light-dark-neutral italic text-large p-2 border-dashed">
                            <Text>期待这边多出来一个 米画师 图标的一天</Text>
                            <Text className="text-right">——2024.8.15留</Text>
                        </OutlinedBox>
                    </div>
                    <OutlinedBox className="w-full p-4">
                        <NetworkErrorable resp={selfIntro}>
                            {data => <Markdown body={data} />}
                        </NetworkErrorable>
                    </OutlinedBox>
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="友链">
                    <Text className="font-sh-sans italic text-light-dark-neutral">
                        想加上自己的可以来<Link href={"https://github.com/443eb9/aetheric-cargo"}><u>这里</u></Link> ヾ(≧▽≦*)o
                    </Text>
                    <Suspense>
                        <LinkExchange></LinkExchange>
                    </Suspense>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="一些项目">
                    <Suspense>
                        <Projects></Projects>
                    </Suspense>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="留言板">
                    <GiscusSection className="mt-4"></GiscusSection>
                </AboutSection>
            </ContentWrapper>
        </main>
    )
}
