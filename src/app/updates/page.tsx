import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";
import BlogIslands from "@/components/updates/blog-islands";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchIslandCount, fetchIslandsMeta } from "@/data/island";
import PageSwitcher from "@/components/updates/page-switcher";
import { IslandCount, IslandMeta } from "@/data/model";

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page({ searchParams }: {
    searchParams?: {
        page?: string,
        len?: string,
        tags?: string,
    }
}) {
    const page = Number.parseInt(searchParams?.page ?? "0");
    const length = Number.parseInt(searchParams?.len ?? "10");
    const tagsFilter = Number.parseInt(searchParams?.tags ?? "0");
    let islands: IslandMeta[] = (await fetchIslandsMeta(page, length, tagsFilter)).data;
    let total: IslandCount = (await fetchIslandCount(tagsFilter)).data;

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-20"></div>
            <div className="flex flex-col gap-10 pr-2 md:pr-0">
                <aside className="block md:hidden px-5">
                    <Suspense>
                        <BlogInfo></BlogInfo>
                    </Suspense>
                </aside>
                <ContentWrapper className="gap-10">
                    <Suspense>
                        <BlogIslands islands={islands}></BlogIslands>
                    </Suspense>
                    <aside className="hidden max-w-72 md:block">
                        <Suspense>
                            <BlogInfo></BlogInfo>
                        </Suspense>
                    </aside>
                </ContentWrapper>
                <ContentWrapper className="flex-col gap-6">
                    <PageSwitcher islandCount={total.count} currentPage={page} currentLength={length}></PageSwitcher>
                </ContentWrapper>
            </div>
        </main>
    );
}
