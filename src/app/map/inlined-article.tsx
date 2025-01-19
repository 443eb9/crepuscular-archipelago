"use client"

import { IslandMeta } from "@/data/model";
import ArticleHeader from "../(pages)/island/article-header";
import OutlinedBox from "@/components/outlined-box";
import Markdown from "@/components/markdown";
import OutlinedButton from "@/components/outlined-button";
import { IoArrowForwardOutline, IoChevronDownOutline, IoChevronUpOutline, IoCloseOutline } from "react-icons/io5";
import { useContext, useState } from "react";
import { visitingIslandContext } from "./islands-map";
import Link from "next/link";
import Text from "@/components/text";

export default function InlinedArticle({ meta, content, params }: { meta: IslandMeta, content: string, params: URLSearchParams }) {
    const [headerExpanded, setHeaderExpanded] = useState(true)
    const visitingIsland = useContext(visitingIslandContext)

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <OutlinedBox className="flex flex-col">
                <div className="flex grow">
                    {headerExpanded && <ArticleHeader island={meta} params={params} />}
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
                            <Link
                                href={`/island?id=${meta.id}&${params}`}
                                target="_blank"
                            >
                                <IoArrowForwardOutline size={32} />
                            </Link>
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
            <OutlinedBox className="overflow-x-clip overflow-y-auto p-4 h-full">
                <Markdown body={content} />
            </OutlinedBox>
        </div>
    )
}
