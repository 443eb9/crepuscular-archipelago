"use client"

import OutlinedButton from "@/components/outlined-button"
import Text from "@/components/text"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"
import clsx from "clsx"
import { usePathname } from "next/navigation"
import LinkNoPrefetch from "./link-no-prefetch"

export default function Pagination({ total, current, buttonSize, params }: { total: number, current: number, buttonSize: number, params: QueryParams }) {
    const pathname = usePathname()

    return (
        <>
            {
                Array.from(Array(total).keys()).map(page =>
                    <LinkNoPrefetch key={page} href={`${pathname}?${queryParamsToSearchParams({ ...params, page })}`}>
                        <OutlinedButton
                            key={page}
                            className={clsx(
                                `aspect-square
                            ${current == page ? "text-dark-contrast dark:text-light-contrast" : ""}`,
                                { "bg-light-contrast dark:bg-dark-contrast": current == page }
                            )}
                            style={{
                                width: `${buttonSize}px`
                            }}
                        >
                            <Text
                                className="font-bender text-2xl font-bold"
                                noFont
                            >
                                {page}
                            </Text>
                        </OutlinedButton>
                    </LinkNoPrefetch>
                )
            }
        </>
    )
}
