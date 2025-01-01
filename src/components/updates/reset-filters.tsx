'use client'

import Link from "next/link"
import OutlinedButton from "../common/interact/outlined-button"
import { searchParamReset } from "@/data/search-param-util"
import { useSearchParams } from "next/navigation"
import ZhEnLabel from "../common/zh-en-label"

export default function ResetFilters() {
    return (
        <Link href={`/updates?${searchParamReset(["tags", "advf", "page"], useSearchParams())}`}>
            <OutlinedButton className="w-full h-8 mt-2">
                <ZhEnLabel zh="重置" en="Reset" className="text-medium"></ZhEnLabel>
            </OutlinedButton>
        </Link>
    )
}
