"use client"

import { IslandMeta } from "@/data/model";
import ArticleHeader from "../(pages)/island/article-header";
import OutlinedBox from "@/components/outlined-box";
import OutlinedButton from "@/components/outlined-button";
import { IoArrowForwardOutline, IoChevronDownOutline, IoChevronUpOutline, IoCloseOutline } from "react-icons/io5";
import { useContext, useState } from "react";
import { visitingIslandContext } from "./islands-map";
import Text from "@/components/text";
import { QueryParams } from "@/data/search-param-util";
import ArticleBody from "../(pages)/island/article-body";
import LinkNoPrefetch from "@/components/link-no-prefetch";

export default function InlinedArticle({ meta, content, params }: { meta: IslandMeta, content: string, params: QueryParams }) {
    const [headerExpanded, setHeaderExpanded] = useState(true)
    const visitingIsland = useContext(visitingIslandContext)

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <OutlinedBox className="flex flex-col">
                <div className="flex grow">
                    {headerExpanded && <ArticleHeader island={meta} params={params} noGoBack />}
                </div>
                <div className="flex justify-between">
                    {
                        headerExpanded
                            ? <div></div>
                            : <div className="flex items-center pl-4">
                                <Text elem="h1" className="text-lg">{meta.title}</Text>
                            </div>
                    }
                    <div className="flex gap-2 m-2">
                        <OutlinedButton>
                            <LinkNoPrefetch
                                href={`/island?id=${meta.id}&${params}`}
                                target="_blank"
                            >
                                <IoArrowForwardOutline size={32} />
                            </LinkNoPrefetch>
                        </OutlinedButton>
                        <OutlinedButton onClick={() => visitingIsland?.setter(undefined)}>
                            <IoCloseOutline size={32} />
                        </OutlinedButton>
                        <OutlinedButton onClick={() => setHeaderExpanded(!headerExpanded)}>
                            {headerExpanded ? <IoChevronUpOutline size={32} /> : <IoChevronDownOutline size={32} />}
                        </OutlinedButton>
                    </div>
                </div>
            </OutlinedBox>
            <div className="h-full overflow-y-auto">
                <ArticleBody island={meta} body={content} />
            </div>
        </div>
    )
}
