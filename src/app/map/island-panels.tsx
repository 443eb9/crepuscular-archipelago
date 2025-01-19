"use client"

import OutlinedBox from "@/components/outlined-box";
import Pagination from "../(pages)/(islandsView)/pagination";
import BlogInfo from "../(pages)/updates/blog-info";
import { TagData } from "@/data/model";
import { QueryParams } from "@/data/utils";
import Text from "@/components/text";
import { useContext } from "react";
import { visitingIslandContext } from "./islands-map";
import { useSearchParams } from "next/navigation";
import InlinedArticle from "./inlined-article";
import NavButtons from "../(pages)/nav-buttons";
import ThemeSwither from "@/components/theme-switcher";

export default function IslandPanels({
    totalPages, currentPage, queryParams, allTags
}: {
    totalPages: number, currentPage: number, queryParams: QueryParams, allTags: TagData[]
}) {
    const searchParams = new URLSearchParams(useSearchParams())
    const visitingIsland = useContext(visitingIslandContext)

    return (
        <div className="absolute z-50 w-full h-full pointer-events-none">
            <div className="absolute left-2 top-2 flex flex-col gap-2">
                <OutlinedBox className="pointer-events-auto backdrop-blur aspect-square flex items-center justify-center">
                    <ThemeSwither />
                </OutlinedBox>
                <OutlinedBox className="flex flex-col gap-2 p-2 backdrop-blur-md pointer-events-auto">
                    {
                        totalPages > 0
                            ? <Pagination total={totalPages} current={currentPage} buttonSize={36} />
                            : <Text className="font-bender font-bold">Void</Text>
                    }
                </OutlinedBox>
            </div>
            <OutlinedBox className="absolute right-2 top-2 w-72 backdrop-blur-md pointer-events-auto">
                <BlogInfo queryParams={queryParams} allTags={allTags} />
            </OutlinedBox>
            {
                visitingIsland?.value &&
                <div className="w-full h-full flex justify-center items-center pointer-events-auto">
                    <div className="backdrop-blur-md w-[95%] h-[95%] pointer-events-auto">
                        <InlinedArticle
                            meta={visitingIsland.value.meta}
                            content={visitingIsland.value.content.content}
                            params={searchParams}
                        />
                    </div>
                </div>
            }
            <div className="flex w-full justify-center">
                <OutlinedBox className="absolute p-1 top-2 backdrop-blur-md pointer-events-auto">
                    <NavButtons className="w-16 h-12 p-1" />
                </OutlinedBox>
            </div>
        </div>
    )
}
