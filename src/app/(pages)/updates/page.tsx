import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";
import BlogIslands from "@/components/updates/blog-islands";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchIslandCount, fetchIslandsMeta } from "@/data/api";
import PageSwitcher from "@/components/updates/page-switcher";
import NetworkErrorFallback from "@/components/common/network-error-fallback";
import { ErrorResponse } from "@/data/requests";

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

    let islands = await fetchIslandsMeta(page, length, tagsFilter, advancedFilter);
    let total = await fetchIslandCount(tagsFilter, advancedFilter);
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
                        {
                            islands instanceof ErrorResponse
                                ? <NetworkErrorFallback error={islands}></NetworkErrorFallback>
                                : <Suspense>
                                    <BlogIslands islands={islands.data} params={params}></BlogIslands>
                                </Suspense>
                        }
                        {
                            total instanceof ErrorResponse
                                ? <NetworkErrorFallback error={total}></NetworkErrorFallback>
                                : <PageSwitcher islandCount={total.data.count} currentPage={page} currentLength={length}></PageSwitcher>
                        }
                    </div>
                    <aside className="hidden md:flex w-full max-w-72">
                        <div className="fixed max-w-72 md:flex md:flex-col gap-5">
                            <Suspense>
                                <BlogInfo></BlogInfo>
                            </Suspense>
                        </div>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    );
}
