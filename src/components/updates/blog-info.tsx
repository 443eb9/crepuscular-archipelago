import { IoSearchSharp } from "react-icons/io5";
import OutlinedButton from "../common/outlined-button";
import { fetchAllTags } from "@/data/card";
import Tag from "../common/tag";
import OutlinedBox from "../common/outlined-box";

export default async function BlogInfo() {
    const tags = await fetchAllTags();

    return (
        <OutlinedBox className="flex flex-col gap-4 p-2">
            <div className="flex gap-2 items-center h-10 w-full">
                <input type="text" className="flex-1 p-1 h-full bg-transparent outline-none focus:border-b-2 border-neutral-900 dark:border-neutral-50 font-sh-sans placeholder:font-bender" placeholder="Search Islands" />
                <div className="w-10 h-10">
                    <OutlinedButton>
                        <IoSearchSharp className="text-2xl"></IoSearchSharp>
                    </OutlinedButton>
                </div>
            </div>
            <div className="flex flex-col">
                <h1 className="font-bender font-bold text-lg">Travel To:</h1>
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
