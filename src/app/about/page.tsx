import { fetchGithubProjectStat, wrappedFetch } from "@/data/api";
import { frontendEndpoint } from "@/data/endpoints";
import { ProjectData, SelfTitleData } from "@/data/model";
import { Metadata } from "next";
import AboutClientPageWrapper from "./about-client-page-wrapper";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "About - Crepuscular Archipelago",
}

export default async function Page() {
    const Wrapper = async () => {
        const selfIntro = await wrappedFetch<string>(frontendEndpoint("/self-intro.md"), "GET")
        const projects = await wrappedFetch<ProjectData[]>(frontendEndpoint("/projects.json"), "GET")
        const projectGhStats = projects.ok ? await Promise.all(projects.data.map(async proj => await fetchGithubProjectStat(proj.owner, proj.name))) : undefined
        const titles = await wrappedFetch<SelfTitleData[]>(frontendEndpoint("/self-titles.json"), "GET")
        const emoticons = await wrappedFetch<string[]>(frontendEndpoint("/emoticons.json"), "GET")

        return (
            <AboutClientPageWrapper selfIntro={selfIntro} projects={projects} projectGhStats={projectGhStats} titles={titles} emoticons={emoticons} />
        )
    }

    return <Suspense fallback={<div></div>}><Wrapper /></Suspense>
}
