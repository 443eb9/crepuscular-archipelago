"use client"

import OutlinedButton from "@/components/outlined-button"
import { usePathname, useSearchParams } from "next/navigation"
import AsciiText from "./text/ascii-text"
import Link from "next/link"
import { processUrlSearchParams, searchParamsToUrl } from "@/data/search-param-util"
import { constructPath } from "@/data/utils"
import { fetchIslandCount } from "@/data/api"
import { HTMLAttributes } from "react"

export default function Pagination({ total, ...props }: { total: number } & HTMLAttributes<HTMLButtonElement>) {
    const pathname = usePathname()
    const params = processUrlSearchParams(useSearchParams())

    return Array.from(Array(Math.ceil(total / params.len)).keys().map(page =>
        <OutlinedButton
            key={page}
            {...props}
            className={
                `aspect-square
                                ${params.page == page ? "text-dark-contrast dark:text-light-contrast" : ""}
                                ${params.page == page ? "bg-light-contrast dark:bg-dark-contrast" : ""} `
                + props.className
            }
            inv={params.page == page}
        >
            <Link href={constructPath(pathname, searchParamsToUrl({ ...params, page }))}>
                <AsciiText className="font-bender text-2xl font-bold">
                    {page}
                </AsciiText>
            </Link>
        </OutlinedButton>
    ))

}
