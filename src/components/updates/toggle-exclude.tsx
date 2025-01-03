'use client'

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Toggle from "../common/interact/toggle"
import { searchParamBitGet, searchParamBitXor, searchParamReset } from "@/data/search-param-util"
import ZhEnLabel from "../common/zh-en-label"

export default function ToggleExclude() {
    const paramsRO = useSearchParams()

    return (
        <Link href={`/updates?${searchParamReset(["page"], searchParamBitXor(1, "advf", paramsRO)).toString()}`}>
            <Toggle enabled={searchParamBitGet(1, "advf", paramsRO)}>
                <ZhEnLabel zh="反选" en="Invert" className="font-medium"></ZhEnLabel>
            </Toggle>
        </Link>
    )
}
