"use client"

import OutlinedBox from "@/components/outlined-box"
import Pagination from "../../components/pagination"
import BlogInfo from "../../components/blog-info"
import { TagData } from "@/data/model"
import Text from "@/components/text"
import { useContext } from "react"
import { visitingIslandContext } from "./islands-map"
import InlinedArticle from "./inlined-article"
import NavButtons from "../(pages)/nav-buttons"
import ThemeSwither from "@/components/theme-switcher"
import { QueryParams } from "@/data/search-param-util"
import ContentWrapper from "@/components/content-wrapper"

export default function IslandPanels({
    totalPages, currentPage, params, allTags
}: {
    totalPages: number, currentPage: number, params: QueryParams, allTags: TagData[]
}) {
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
                            ? <Pagination total={totalPages} current={currentPage} buttonSize={36} params={params} />
                            : <Text className="font-bender font-bold">Void</Text>
                    }
                </OutlinedBox>
            </div>
            <OutlinedBox className="absolute right-2 top-2 w-72 backdrop-blur-md pointer-events-auto">
                <BlogInfo params={params} allTags={allTags} />
            </OutlinedBox>
            {
                visitingIsland?.value &&
                <div className="absolute z-50 w-full h-full flex justify-center items-center pointer-events-auto">
                    <div className="absolute -z-10 w-full h-full bg-black opacity-50" />
                    <ContentWrapper containerClassName="overflow-y-auto h-[95%]" className="">
                        <div className="bg-light-background dark:bg-dark-background">
                            <InlinedArticle
                                meta={visitingIsland.value.meta}
                                content={visitingIsland.value.content.content}
                                params={params}
                            />
                        </div>
                    </ContentWrapper>
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
