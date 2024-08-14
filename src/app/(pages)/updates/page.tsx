import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";
import BlogIslands from "@/components/updates/blog-islands";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchIslandCount, fetchIslandsMeta } from "@/data/island";
import PageSwitcher from "@/components/updates/page-switcher";
import { IslandCount, IslandMeta } from "@/data/model";
import LinkExchange from "@/components/updates/link-exchange";

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page({ searchParams }: {
    searchParams?: {
        page?: string,
        len?: string,
        tags?: string,
        advf?: string
    }
}) {
    const page = parseInt(searchParams?.page ?? "0");
    const length = parseInt(searchParams?.len ?? "10");
    const tagsFilter = parseInt(searchParams?.tags ?? "0");
    const advancedFilter = parseInt(searchParams?.advf ?? "0");

    let islands: IslandMeta[] = (await fetchIslandsMeta(page, length, tagsFilter, advancedFilter)).data;
    let total: IslandCount = (await fetchIslandCount(tagsFilter, advancedFilter)).data;
    const params = new URLSearchParams(searchParams);

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
                    <div className="flex flex-col gap-8 w-full">
                        <Suspense>
                            <BlogIslands islands={islands} params={params}></BlogIslands>
                        </Suspense>
                        <PageSwitcher islandCount={total.count} currentPage={page} currentLength={length}></PageSwitcher>
                        <div className="block md:hidden">
                            <LinkExchange></LinkExchange>
                        </div>
                    </div>
                    <aside className="hidden md:flex w-full max-w-72">
                        <div className="fixed max-w-72 md:flex md:flex-col gap-5">
                            <Suspense>
                                <BlogInfo></BlogInfo>
                            </Suspense>
                            <LinkExchange></LinkExchange>
                        </div>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    );
}
