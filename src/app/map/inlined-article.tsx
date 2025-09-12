"use client"

import OutlinedBox from "@/components/outlined-box";
import OutlinedButton from "@/components/outlined-button";
import { IoArrowForwardOutline, IoChevronDownOutline, IoChevronUpOutline, IoCloseOutline } from "react-icons/io5";
import { useContext, useState } from "react";
import { InlinedArticleSuppressBlur, visitingIslandContext } from "./island-panels";
import ContentWrapper from "@/components/content-wrapper";

export default function InlinedArticle() {
    const [headerExpanded, setHeaderExpanded] = useState(true)
    const visitingIsland = useContext(visitingIslandContext)

    if (!visitingIsland?.value) {
        return;
    }

    return (<div className="absolute z-50 w-full h-full flex justify-center items-center pointer-events-auto">
        <div className="absolute -z-10 w-full h-full bg-black opacity-50" />
        <ContentWrapper className={`w-full overflow-y-auto h-[95%] {InlinedArticleSuppressBlur}`}>
            <div className="w-full h-full flex flex-col gap-2">
                <OutlinedBox className="flex flex-col bg-light-background dark:bg-dark-background">
                    <div className="flex grow">
                        {headerExpanded && <ArticleHeader island={visitingIsland.value.meta} params={params} noGoBack />}
                    </div>
                    <div className="flex justify-between">
                        {
                            headerExpanded
                                ? <div></div>
                                : <div className="flex items-center pl-4">
                                    <Text elem="h1" className="text-lg">{visitingIsland.value.meta.title}</Text>
                                </div>
                        }
                        <div className="flex gap-2 m-2">
                            <OutlinedButton>
                                <LinkNoPrefetch
                                    href={`/island/${visitingIsland.value.meta.id}?${params}`}
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
                    <div className="bg-light-background dark:bg-dark-background">
                        <ArticleBody body={visitingIsland.value.content} />
                    </div>
                </div>
            </div>
        </ContentWrapper>
    </div>
    )
}
