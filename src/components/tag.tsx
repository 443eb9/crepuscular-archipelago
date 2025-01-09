"use client"

import Text from "./text";
import { useRouter } from "next/navigation";
import { searchParamBitXor } from "@/data/search-param-util";
import { TagData } from "@/data/model";
import clsx from "clsx";
import OutlinedButton from "./outlined-button";
import { usePathname } from "next/navigation";

export default function Tag({
    tag, hideAmount, searchParams
}: Readonly<
    { tag: TagData, hideAmount?: boolean, searchParams: URLSearchParams }
>) {
    const router = useRouter()
    const params = new URLSearchParams(searchParams)
    const pathname = usePathname()
    const curTags = parseInt(params.get("tags") ?? "0")
    const paramsAfterClick = searchParamBitXor(tag.id, "tags", searchParams)

    return (
        <OutlinedButton
            onClick={() => router.replace(`${pathname}?${paramsAfterClick}`)}
            className={clsx(`flex items-baseline gap-1 p-1`,
                {
                    "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast":
                        (curTags >> tag.id & 1) == 1,
                }
            )}
        >
            <Text className="text-sm">{tag.name}</Text>
            {
                !hideAmount &&
                <Text className="font-neon text-sm">{tag.amount}</Text>
            }
        </OutlinedButton>
    )
}
