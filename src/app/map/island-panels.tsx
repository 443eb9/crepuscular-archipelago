"use client"

import OutlinedBox from "@/components/outlined-box";
import Pagination from "../(pages)/(islandsView)/pagination";
import BlogInfo from "../(pages)/updates/blog-info";
import { TagData } from "@/data/model";
import { QueryParams } from "@/data/utils";
import Text from "@/components/text";

export default function IslandPanels({
    totalPages, currentPage, queryParams, allTags
}: {
    totalPages: number, currentPage: number, queryParams: QueryParams, allTags: TagData[]
}) {
    return (
        <div className="absolute z-50 w-full h-full pointer-events-none p-2">
            <OutlinedBox className="absolute flex flex-col gap-2 p-2 backdrop-blur-md pointer-events-auto">
                {
                    totalPages > 0
                        ? <Pagination total={totalPages} current={currentPage} />
                        : <Text className="font-bender font-bold">Void</Text>
                }
            </OutlinedBox>
            <OutlinedBox className="absolute right-0 w-72 backdrop-blur-md pointer-events-auto">
                <BlogInfo queryParams={queryParams} allTags={allTags} />
            </OutlinedBox>
        </div>
    )
}
