import { IoSearchSharp } from "react-icons/io5";
import OutlinedButton from "../common/outlined-button";
import { fetchAllTags } from "@/data/island";
import Tag from "../common/tag";
import OutlinedBox from "../common/outlined-box";
import ToggleExclude from "./toggle-exclude";
import { TagData } from "@/data/model";
import InputBox from "../common/input-box";

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
                <div>
                    <h1 className="font-bender font-bold text-lg">Travel To:</h1>
                    <ToggleExclude></ToggleExclude>
                </div>
                <div className="flex flex-wrap gap-1">
                    {
                        tags.map((tag) => (
                            <Tag tag={tag} showAmount key={tag.name}></Tag>
                        ))
                    }
                </div>
            </div>
        </OutlinedBox>
    );
}
