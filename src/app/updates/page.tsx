'use client';

import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";
import { useSearchParams } from "next/navigation";
import BlogIslands from "@/components/updates/blog-islands";
import { Suspense } from "react";

export default function Page() {
    const params = useSearchParams();
    const page = Number.parseInt(params.get("p") ?? "0");
    const length = Number.parseInt(params.get("len") ?? "10");

    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-20"></div>
            <div className="flex flex-col gap-10 md:px-0">
                <aside className="block md:hidden px-5">
                    <BlogInfo></BlogInfo>
                </aside>
                <ContentWrapper className="gap-10">
                    <Suspense>
                        <BlogIslands page={page} length={length}></BlogIslands>
                    </Suspense>
                    <aside className="hidden md:block w-72">
                        <BlogInfo></BlogInfo>
                    </aside>
                </ContentWrapper>
            </div>
        </main>
    );
}
