import { FaClock } from "react-icons/fa6"
import { IslandMeta } from "@/data/model"
import { TbClockQuestion } from "react-icons/tb"
import DiagLines from "@/components/decos/diag-lines"
import { QueryParams } from "@/data/search-param-util"
import TagsContainer from "@/components/tags-container"
import LinkNoPrefetch from "@/components/link-no-prefetch"
import AnimHoverInvertBox from "@/components/anim/anim-hover-invert"
import Text from "@/components/text"
import License from "@/components/license"
import IslandState from "@/components/island-state"

export default function ArticleHeader({ island, params, noGoBack }: { island: IslandMeta, params: QueryParams, noGoBack?: boolean }) {
    return (
        <div className="flex justify-between p-5 w-full">
            <div className="flex flex-col gap-1 w-full">
                {
                    !noGoBack &&
                    <div className="flex flex-shrink">
                        <AnimHoverInvertBox>
                            <Text className="font-neon font-bold px-1" noFont>
                                <LinkNoPrefetch
                                    href={`/updates?${params.toString()}`}
                                >
                                    &lt; $ cd .._
                                </LinkNoPrefetch>
                            </Text>
                        </AnimHoverInvertBox>
                    </div>
                }
                <h1 className="w-24 font-bender text-lg font-bold px-2
                bg-light-contrast dark:bg-dark-contrast
                text-dark-contrast dark:text-light-contrast">{`# ${island.id}`}</h1>
                <div className="flex flex-col">
                    <h1 className="font-sh-serif text-2xl font-bold mb-1">{island.title}</h1>
                    <h2 className="font-sh-serif font-bold italic text-md mb-1">{island.subtitle}</h2>
                </div>
                <TagsContainer island={island} params={params} />
                {
                    island.state == "workInProgress" &&
                    <div className="text-light-contrast bg-warn">
                        注意：这是一篇尚未完成的文章，其中可能存在不恰当的表达甚至错误！
                    </div>
                }
                {
                    island.license == "Repost" &&
                    <div className="text-light-contrast bg-warn">
                        注意：这是一篇非原创的文章，请注意查看文章简介和正文中的原文地址！
                    </div>
                }
                <IslandState date={island.date} state={island.state} />
                <License
                    className="flex gap-1 dark:invert"
                    license={island.license}
                    iconWidth={20}
                    iconHeight={20}
                />
                <div className="flex gap-3 mt-1">
                    <div className="bg-light-contrast dark:bg-dark-contrast w-3 h-3"></div>
                    <div className="bg-light-contrast dark:bg-dark-contrast w-3 h-3"></div>
                    <div className="bg-light-contrast dark:bg-dark-contrast w-3 h-3"></div>
                    <div className="bg-light-contrast dark:bg-dark-contrast w-3 h-3"></div>
                </div>
            </div>
            <div className="flex flex-col justify-between items-end">
                <DiagLines className="w-8 md:w-14 h-8 md:h-14" scale="500%"></DiagLines>
                <div className="bg-light-contrast dark:bg-dark-contrast w-2" style={{ height: "calc(100% - 75px)" }}></div>
            </div>
        </div>
    )
}
