import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";
import BlogIslands from "@/components/updates/blog-islands";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default function Page({ searchParams }: {
    searchParams?: {
        page?: string,
        len?: string,
        tags?: string,
    }
}) {
    const page = Number.parseInt(searchParams?.page ?? "0");
    const length = Number.parseInt(searchParams?.len ?? "10");
    const tagsFilter = Number.parseInt(searchParams?.tags ?? "0");

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
                        <BlogIslands page={page} length={length} tagsFilter={tagsFilter}></BlogIslands>
                    </Suspense>
                    <aside className="hidden md:block w-72">
                        <Suspense>
                            <BlogInfo></BlogInfo>
                        </Suspense>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    );
}
