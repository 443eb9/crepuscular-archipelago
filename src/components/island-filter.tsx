"use client"

import Tag from "@/components/tag"
import { usePathname, useSearchParams } from "next/navigation"
import { advancedFilterEnabled, extractBits, setAdvancedFilter, toggleAdvancedFilter } from "@/data/utils"
import BodyText from "./text/body-text"
import { fetchAllTags } from "@/data/api"
import Link from "next/link"
import { processUrlSearchParams, searchParamsToUrl } from "@/data/search-param-util"
import Toggle from "./toggle"
import RadioButtonGroup from "./radio-button-group"
import CheckboxGroup from "./checkbox-group"
import OutlinedBox from "./outlined-box"
import OutlinedButton from "./outlined-button"
import AsciiText from "./text/ascii-text"
import EndDecoLine from "./end-deco-line"
import RectDot from "./rect-dot"
import FocusRect from "./svg-deco/focus-rect"
import DiagLines from "./svg-deco/diag-lines"
import { TagData } from "@/data/model"

export default function IslandFilter({ allTags }: { allTags: TagData[] }) {
    const pathname = usePathname()
    const params = processUrlSearchParams(useSearchParams())

    return (
        <div className="relative">
            <AsciiText className="absolute w-24 h-4 -top-4 pl-2 text-[8pt] font-bold bg-dark-0 dark:bg-light-0" inv>FILTER</AsciiText>
            <div className="absolute right-3 top-3 flex flex-col gap-2">
                <RectDot size={8} className="rotate-45" cnt={2} />
            </div>
            <div className="absolute -bottom-5 flex gap-1 justify-end w-full">
                <DiagLines className="w-full h-4" style={{ maskSize: "50%", WebkitMaskSize: "50%" }} />
                <div className="bg-dark-0 dark:bg-light-0 w-2" />
            </div>
            <OutlinedBox className="relative flex flex-col flex-shrink gap-4 p-2">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <BodyText className="font-bold text-lg pb-[3px]">定位</BodyText>
                        <FocusRect className="h-4 aspect-square" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {allTags.map((tag, index) =>
                            <Tag key={index} tag={tag} />
                        )}
                    </div>
                    <EndDecoLine className="pt-3 pb-1" deco={<RectDot size={3} />} decoSize={3} lineThickness={1} decoGap={4} lineStyle="dashed" />
                    <div className="flex gap-2 items-center">
                        <BodyText className="font-bold text-lg pb-[3px]">高级过滤</BodyText>
                        <FocusRect className="h-4 aspect-square" />
                    </div>
                    <div>
                        <Link href={`${pathname}?${searchParamsToUrl({ ...params, advf: toggleAdvancedFilter(params.advf, "invert") }).toString()}`}>
                            <Toggle enabled={advancedFilterEnabled(params.advf, "invert")}>
                                <BodyText>反选 Tag</BodyText>
                            </Toggle>
                        </Link>
                        <BodyText className="font-bold">Tag 过滤逻辑</BodyText>
                        <RadioButtonGroup
                            className="flex justify-around"
                            labels={[
                                { name: "和", filter: setAdvancedFilter(params.advf, "tag-or-logic", false) },
                                { name: "或", filter: setAdvancedFilter(params.advf, "tag-or-logic", true) },
                            ].map(node =>
                                <Link href={`${pathname}?${searchParamsToUrl({ ...params, advf: node.filter }).toString()}`} key={node.name}>
                                    <BodyText>{node.name}</BodyText>
                                </Link>
                            )}
                            enabled={params.advf >> 2 & 1}
                        />
                        <BodyText className="font-bold">排除状态</BodyText>
                        <CheckboxGroup
                            className="grid grid-cols-2"
                            labels={[
                                { name: "已完成", filter: toggleAdvancedFilter(params.advf, "exclude-finished") },
                                { name: "未完成", filter: toggleAdvancedFilter(params.advf, "exclude-wip") },
                                { name: "长期项目", filter: toggleAdvancedFilter(params.advf, "exclude-ltp") },
                                { name: "已弃坑", filter: toggleAdvancedFilter(params.advf, "exclude-deprecated") },
                                { name: "已删除", filter: toggleAdvancedFilter(params.advf, "exclude-deleted") },
                            ].map(node =>
                                <Link href={`${pathname}?${searchParamsToUrl({ ...params, advf: node.filter })}`} key={node.name}>
                                    <BodyText>{node.name}</BodyText>
                                </Link>
                            )}
                            enabled={extractBits(params.advf >> 3 & 0b11111)}
                        />
                    </div>
                    <Link href={`${pathname}?${searchParamsToUrl({ ...params, tags: 0, advf: 0 }).toString()}`}>
                        <OutlinedButton className="justify-center items-center w-full h-8 mt-2">
                            <BodyText>重置</BodyText>
                        </OutlinedButton>
                    </Link>
                </div>
            </OutlinedBox>
        </div>
    )
}
