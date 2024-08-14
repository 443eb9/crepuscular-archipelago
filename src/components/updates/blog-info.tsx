import { IoSearchSharp } from "react-icons/io5";
import OutlinedButton from "../common/interact/outlined-button";
import { fetchAllTags } from "@/data/island";
import Tag from "../common/tag";
import OutlinedBox from "../common/outlined-box";
import { TagData } from "@/data/model";
import InputBox from "../common/interact/input-box";
import EndpointDottedSegment from "../common/decos/endpoint-dotted-segment";
import AdvancedFilters from "./advanced-filters";
import ResetFilters from "./reset-filters";

export default async function BlogInfo() {
    const tags: TagData[] = (await fetchAllTags()).data;

    return (
        <OutlinedBox className="flex flex-col gap-4 p-2">
            <div className="flex gap-2 items-center h-10 w-full">
                <InputBox placeholder="Search Islands(WIP)"></InputBox>
                <div>
                    <OutlinedButton className="w-10 h-10">
                        <IoSearchSharp className="text-2xl"></IoSearchSharp>
                    </OutlinedButton>
                </div>
            </div>
            <div className="flex flex-col">
                <h1 className="font-bender font-bold text-lg">Locate:</h1>
                <div className="flex flex-wrap gap-1">
                    {
                        tags.map((tag) => (
                            <Tag tag={tag} showAmount key={tag.name}></Tag>
                        ))
                    }
                </div>
                <EndpointDottedSegment thickness={1} dotSize={5} style="dashed" className="my-2"></EndpointDottedSegment>
                <h1 className="font-bender font-bold text-lg">Advanced Filters:</h1>
                <AdvancedFilters></AdvancedFilters>
                <ResetFilters></ResetFilters>
            </div>
        </OutlinedBox>
    );
}
