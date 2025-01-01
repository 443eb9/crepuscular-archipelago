import { FaClock } from "react-icons/fa6"
import OutlinedBox from "../common/outlined-box"
import { IslandMeta } from "@/data/model"
import Tag from "../common/tag"
import Link from "next/link"
import DiagLines from "../common/decos/diag-lines"
import { TbClockQuestion } from "react-icons/tb"
import SpTag from "../common/sp-tag"
import HoverInvertBox from "../common/anim/hover-invert-box"

export default function ArticleHeader({ meta, params }: { meta: IslandMeta, params: URLSearchParams }) {
    params.delete("id")

    return (
        <OutlinedBox className="flex justify-between p-5">
            <div className="flex flex-col gap-1">
                <HoverInvertBox from="left">
                    <Link
                        href={`/updates?${params.toString()}`}
                        className="font-argon font-bold bg-dark-contrast dark:bg-light-contrast p-1"
                    >
                        &lt $ cd .._
                    </Link>
                </HoverInvertBox>
                <h1 className="w-24 font-bender text-lg font-bold px-2
                bg-light-contrast dark:bg-dark-contrast
                text-dark-contrast dark:text-light-contrast">{`# ${meta.id}`}</h1>
                <div className="flex flex-col">
                    <h1 className="font-sh-serif text-2xl font-bold mb-1">{meta.title}</h1>
                    <h2 className="font-sh-serif font-bold italic text-md mb-1">{meta.subtitle}</h2>
                </div>
                <div className="flex gap-1">
                    {meta.tags.map((tag) => <Tag tag={tag} key={tag.id}></Tag>)}
                    {meta.date == undefined && <SpTag content="WIP"></SpTag>}
                    {!meta.is_original && <SpTag content="非原创"></SpTag>}
                </div>
                {
                    meta.date == undefined &&
                    <div className="text-light-contrast bg-warn">
                        注意：这是一篇尚未完成的文章，其中可能存在不恰当的表达甚至错误！
                    </div>
                }
                {
                    !meta.is_original &&
                    <div className="text-light-contrast bg-warn">
                        注意：这是一篇非原创的文章，请注意查看文章简介和正文中的原文地址！
                    </div>
                }
                <div className="flex items-center gap-2">
                    {
                        meta.date == undefined
                            ? <div className="flex items-center gap-1">
                                <TbClockQuestion className="text-lg"></TbClockQuestion>
                                <div className="font-bender">Future</div>
                            </div>
                            : <div className="flex items-center gap-1">
                                <FaClock></FaClock>
                                <div className="font-bender">{(new Date(meta.date)).toLocaleDateString()}</div>
                            </div>
                    }
                </div>
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
        </OutlinedBox>
    )
}
