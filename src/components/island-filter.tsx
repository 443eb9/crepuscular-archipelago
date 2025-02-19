"use client"

import Text from "@/components/text"
import Tag from "@/components/tag"
import EndpointDottedSegment from "@/components/decos/endpoint-dotted-segment"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"
import OutlinedButton from "@/components/outlined-button"
import { TagData } from "@/data/model"
import Toggle from "@/components/toggle"
import RadioButtonGroup from "@/components/radio-button-group"
import { usePathname } from "next/navigation"
import LinkNoPrefetch from "./link-no-prefetch"
import CheckboxGroup from "./checkbox-group"
import { advancedFilterEnabled, extractBits, setAdvancedFilter, toggleAdvancedFilter } from "@/data/utils"

export default function IslandFilter({ params, allTags }: { params: QueryParams, allTags: TagData[] }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col">
                <Text className="font-bold text-lg">定位</Text>
                <div className="flex flex-wrap gap-1">
                    {
                        allTags.map((tag, index) =>
                            <Tag
                                key={index}
                                tag={tag}
                                params={params}
                            />
                        )
                    }
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="dashed" className="my-2"></EndpointDottedSegment>
                <Text className="font-bold text-lg">高级过滤</Text>
                <div>
                    <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams({ ...params, advf: toggleAdvancedFilter(params.advf, "deleted") }).toString()}`}>
                        <Toggle enabled={advancedFilterEnabled(params.advf, "deleted")}>
                            <Text>排除已删除</Text>
                        </Toggle>
                    </LinkNoPrefetch>
                    <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams({ ...params, advf: toggleAdvancedFilter(params.advf, "invert") }).toString()}`}>
                        <Toggle enabled={advancedFilterEnabled(params.advf, "invert")}>
                            <Text>反选 Tag</Text>
                        </Toggle>
                    </LinkNoPrefetch>
                    <Text className="font-bold">Tag 过滤逻辑</Text>
                    <RadioButtonGroup
                        className="flex justify-around"
                        labels={[
                            { name: "和", filter: setAdvancedFilter(params.advf, "tag-or-logic", false) },
                            { name: "或", filter: setAdvancedFilter(params.advf, "tag-or-logic", true) },
                        ].map(node =>
                            <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams({ ...params, advf: node.filter }).toString()}`} key={node.name}>
                                <Text>{node.name}</Text>
                            </LinkNoPrefetch>
                        )}
                        enabled={params.advf >> 2 & 1}
                    />
                    <Text className="font-bold">排除状态</Text>
                    <CheckboxGroup
                        className="grid grid-cols-2"
                        labels={[
                            { name: "已完成", filter: toggleAdvancedFilter(params.advf, "exclude-finished") },
                            { name: "未完成", filter: toggleAdvancedFilter(params.advf, "exclude-wip") },
                            { name: "长期项目", filter: toggleAdvancedFilter(params.advf, "exclude-ltp") },
                            { name: "已弃坑", filter: toggleAdvancedFilter(params.advf, "exclude-deprecated") },
                        ].map(node =>
                            <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams({ ...params, advf: node.filter })}`} key={node.name}>
                                <Text>{node.name}</Text>
                            </LinkNoPrefetch>
                        )
                        }
                        enabled={extractBits(params.advf >> 3 & 0b1111)}
                    />
                </div>
                <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams({ ...params, tags: 0, advf: 0 }).toString()}`}>
                    <OutlinedButton className="w-full h-8 mt-2">
                        <Text>重置</Text>
                    </OutlinedButton>
                </LinkNoPrefetch>
            </div>
        </div>
    )
}
