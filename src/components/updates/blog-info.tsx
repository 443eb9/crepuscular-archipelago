import { IoSearchSharp } from "react-icons/io5"
import OutlinedButton from "../common/interact/outlined-button"
import { fetchAllTags } from "@/data/api"
import Tag from "../common/tag"
import OutlinedBox from "../common/outlined-box"
import InputBox from "../common/interact/input-box"
import EndpointDottedSegment from "../common/decos/endpoint-dotted-segment"
import AdvancedFilters from "./advanced-filters"
import ResetFilters from "./reset-filters"
import NetworkErrorable from "../common/network-error-fallback"
import ZhEnLabel from "../common/zh-en-label"
import Link from "next/link"

export default async function BlogInfo() {
    const tags = await fetchAllTags()

    return (
        <OutlinedBox className="flex flex-col gap-4 p-2">
            <div className="flex gap-2 items-center h-10 w-full">
                <InputBox placeholder="Search (WIP)"></InputBox>
                <div>
                    <OutlinedButton className="w-10 h-10">
                        <IoSearchSharp className="text-2xl"></IoSearchSharp>
                    </OutlinedButton>
                </div>
            </div>
            <div className="flex flex-col">
                <ZhEnLabel zh="定位" en="Locate" className="font-bold text-large"></ZhEnLabel>
                <div className="flex flex-wrap gap-1">
                    <NetworkErrorable resp={tags}>
                        {data =>
                            data.map((tag) => (
                                <Tag tag={tag} showAmount key={tag.name}></Tag>
                            ))
                        }
                    </NetworkErrorable>
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="dashed" className="my-2"></EndpointDottedSegment>
                <ZhEnLabel zh="高级过滤" en="Advanced Filtering" className="font-bold text-large"></ZhEnLabel>
                <AdvancedFilters></AdvancedFilters>
                <ResetFilters></ResetFilters>
                <EndpointDottedSegment thickness={1} dotSize={5} style="dashed" className="my-2"></EndpointDottedSegment>
                <div className="italic font-bender font-bold">
                    RSS Feed: <Link href={"https://443eb9.dev/rss"} className="underline">https://443eb9.dev/rss</Link>
                </div>
            </div>
        </OutlinedBox>
    )
}
