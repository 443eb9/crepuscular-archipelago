import MeInfo from "@/components/about/me-info";
import SelfIntro from "@/components/about/self-intro";
import ContentWrapper from "@/components/common/content-wrapper";
import DiagLines from "@/components/common/decos/diag-lines";
import EmphasizedBox from "@/components/common/decos/emphasized-box";
import EndpointDottedSegment from "@/components/common/decos/endpoint-dotted-segment";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import GiscusSection from "@/components/island/giscus";
import { Projects } from "@/data/about-projects";
import { ErrorResponse } from "@/data/island";
import { get } from "@/data/requests";
import { Metadata } from "next";
import { ReactNode } from "react";

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
                    <div className="w-full md:w-72">
                        <MeInfo></MeInfo>
                    </div>
                    <SelfIntro></SelfIntro>
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="一些项目" enTitle="Projects">
                    <div className="grid md:grid-cols-2 gap-5 mt-4">
                        {
                            Projects.map(async (project, i) => {
                                const response = await get(`https://api.github.com/repos/${project.owner}/${project.name}`);

                                return (
                                    <EmphasizedBox thickness={3} length={15} key={i} className="font-bender p-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <a className="text-2xl font-bold" target="_blank" href={`https://github.com/${project.owner}/${project.name}`}>{project.name}</a>
                                                {
                                                    response instanceof ErrorResponse
                                                        ? <div className="">Rate limit exceeded, please try again later. :(</div>
                                                        : <div>
                                                            <h3>Language: {response.data.language}</h3>
                                                            <h3>{response.data.stargazers_count} Star(s)</h3>
                                                            <div className="flex gap-5">
                                                                <div className="">
                                                                    Created at {new Date(response.data.created_at).toLocaleDateString()}
                                                                </div>
                                                                <div className="">
                                                                    Updated at {new Date(response.data.updated_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                            <div className="text-light-dark-neutral text-3xl font-bold italic mr-2">{project.owner}</div>
                                        </div>
                                    </EmphasizedBox>
                                );
                            })
                        }
                    </div>
                </AboutSection>
                <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
                <AboutSection title="留言板" enTitle="Message Board">
                    <GiscusSection className="mt-4"></GiscusSection>
                </AboutSection>
            </ContentWrapper>
        </main>
    );
}

function AboutSection({ title, enTitle, children }: { title: string, enTitle: string, children: ReactNode }) {
    return (
        <div className="">
            <div className="flex gap-2">
                <DiagLines scale="400%" className="w-10 h-21"></DiagLines>
                <div className="">
                    <h2 className="text-5xl font-sh-serif font-bold">{title}</h2>
                    <h2 className="text-4xl font-bender italic">{enTitle}</h2>
                </div>
            </div>
            <div className="flex gap-5 mt-2">
                <div className="w-48 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
                <div className="w-16 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
            </div>
            {children}
        </div>
    );
}
