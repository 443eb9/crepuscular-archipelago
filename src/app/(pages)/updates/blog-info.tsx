"use client"

import Link from "next/link"
import OutlinedBox from "@/components/outlined-box"
import Text from "@/components/text"
import Tag from "@/components/tag"
import EndpointDottedSegment from "@/components/decos/endpoint-dotted-segment"
import { QueryParams, queryParamsToSearchParams } from "@/data/utils"
import { searchParamBitGet, searchParamBitSet, searchParamBitXor, searchParamReset } from "@/data/search-param-util"
import OutlinedButton from "@/components/outlined-button"
import { TagData } from "@/data/model"
import Toggle from "@/components/toggle"
import RadioButtonGroup from "@/components/radio-button-group"
import { useRouter } from "next/navigation"

export default function BlogInfo({ queryParams, allTags }: { queryParams: QueryParams, allTags: TagData[] }) {
    const searchParams = queryParamsToSearchParams(queryParams)
    const router = useRouter()

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
                                searchParams={searchParams}
                            />
                        )
                    }
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="dashed" className="my-2"></EndpointDottedSegment>
                <Text className="font-bold text-lg">高级过滤</Text>
                <div>
                    <button
                        onClick={() =>
                            router.replace(`/updates?${searchParamReset(["page"], searchParamBitXor(1, "advf", searchParams))}`)}
                    >
                        <Toggle enabled={searchParamBitGet(1, "advf", searchParams)}>
                            <Text>反选</Text>
                        </Toggle>
                    </button>
                    <Text className="font-bold">逻辑模式</Text>
                    <RadioButtonGroup
                        className="flex justify-around"
                        labels={[
                            { name: "和", v: false },
                            { name: "或", v: true },
                        ].map((node, _) =>
                            <button
                                key={node.name}
                                onClick={() => router.replace(`/updates?${searchParamReset(["page"], searchParamBitSet(2, node.v, "advf", searchParams))}`)}
                            >
                                <Text>{node.name}</Text>
                            </button>
                        )}
                        enabled={searchParamBitGet(2, "advf", searchParams) ? 1 : 0}
                    >
                    </RadioButtonGroup>
                </div>
                <OutlinedButton
                    className="w-full h-8 mt-2"
                    onClick={() =>
                        router.replace(`/updates?${searchParamReset(["tags", "advf", "page"], queryParamsToSearchParams(queryParams))}`)
                    }
                >
                    <Text>重置</Text>
                </OutlinedButton>
            </div>
        </div>
    )
}
