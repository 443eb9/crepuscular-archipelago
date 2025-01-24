"use client"

import Text from "./text"
import { TagData } from "@/data/model"
import clsx from "clsx"
import OutlinedButton from "./outlined-button"
import { usePathname } from "next/navigation"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"
import LinkNoPrefetch from "./link-no-prefetch"

export default function Tag({
    tag, hideAmount, params, pathnameOverride
}: Readonly<
    { tag: TagData, hideAmount?: boolean, params: QueryParams, pathnameOverride?: string }
>) {
    const pathname = pathnameOverride ?? usePathname()
    const paramsAfterClick = {
        ...params,
        tags: params.tags ^ (1 << tag.id),
    }

    return (
        <LinkNoPrefetch href={`${pathname}?${queryParamsToSearchParams(paramsAfterClick).toString()}`}>
            <OutlinedButton
                className={clsx(`flex items-baseline gap-1 p-1`,
                    {
                        "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast":
                            (params.tags >> tag.id & 1) == 1,
                    }
                )}
            >
                <Text className="text-sm">{tag.name}</Text>
                {
                    !hideAmount &&
                    <Text className="font-neon text-sm">{tag.amount}</Text>
                }
            </OutlinedButton>
        </LinkNoPrefetch>
    )
}
