import ContentWrapper from "@/components/content-wrapper"
import { Metadata } from "next"
import MeInfo from "./me-info"
import OutlinedBox from "@/components/outlined-box"
import EndpointDottedSegment from "@/components/decos/endpoint-dotted-segment"
import AboutSection from "./about-section"
import Projects from "./projects"
import GiscusSection from "@/components/giscus-section"
import Text from "@/components/text"
import { wrappedFetch } from "@/data/api"
import NetworkErrorable from "@/components/network-errorable"
import Markdown from "@/components/markdown"
import { frontendEndpoint } from "@/data/endpoints"
import { ProjectData } from "@/data/model"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default async function Page() {
    const selfIntro = await wrappedFetch<string>(frontendEndpoint("/self-intro.md"), "GET")
    const projects = await wrappedFetch<ProjectData[]>(frontendEndpoint("/projects.json"), "GET")

    return (
        <main>
            <ContentWrapper className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-col gap-2 w-full md:w-72">
                        <Suspense>
                            <MeInfo />
                        </Suspense>
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
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid" />
                <AboutSection title="一些项目">
                    <NetworkErrorable resp={projects}>
                        {data => <Projects projects={data} />}
                    </NetworkErrorable>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid" />
                <AboutSection title="留言板">
                    <GiscusSection className="mt-4"></GiscusSection>
                </AboutSection>
            </ContentWrapper>
        </main>
    )
}
