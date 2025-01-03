"use client"

import Text from "./text";
import { useRouter } from "next/navigation";
import { searchParamBitXor } from "@/data/search-param-util";
import { TagData } from "@/data/model";
import OutlinedBox from "./outlined-box";
import clsx from "clsx";

export default function Tag({
    tag, hideAmount, searchParams
}: Readonly<
    { tag: TagData, hideAmount?: boolean, searchParams: URLSearchParams }
>) {
    const router = useRouter()
    const curTags = parseInt(searchParams.get("tags") ?? "0")
    const params = searchParamBitXor(tag.id, "tags", searchParams)

    return (
        <OutlinedBox
            onClick={() => router.replace(`/updates?${params}`)}
            className={clsx(`flex items-baseline gap-1 p-1
                border-light-contrast dark:border-dark-contrast
                hover:bg-light-contrast hover:dark:bg-dark-contrast
                hover:text-dark-contrast hover:dark:text-light-contrast`,
                {
                    "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast": (curTags >> tag.id & 1) == 1,
                }
            )}
        >
            <Text className="text-sm">
                # {tag.name}
            </Text>
            {
                !hideAmount &&
                <Text className="font-neon text-sm">{tag.amount}</Text>
            }
        </OutlinedBox>
    )
}
