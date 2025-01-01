'use client'

import Link from "next/link"
import RadioButtonGroup from "../common/interact/radio-button-group"
import ToggleExclude from "./toggle-exclude"
import { searchParamBitGet, searchParamBitSet, searchParamReset } from "@/data/search-param-util"
import { useSearchParams } from "next/navigation"
import ZhEnLabel from "../common/zh-en-label"

export default function AdvancedFilters() {
    const searchParams = useSearchParams()

    return (
        <div>
            <ToggleExclude></ToggleExclude>
            <ZhEnLabel zh="逻辑模式" en="Logic Mode" className="font-bold"></ZhEnLabel>
            <RadioButtonGroup
                className="flex justify-around"
                labels={[
                    { zh: "和", en: "And &&", v: false },
                    { zh: "或", en: "Or ||", v: true },
                ].map((node, _) =>
                    <Link
                        key={node.en}
                        href={`/updates?${searchParamReset(["page"], searchParamBitSet(2, node.v, "advf", searchParams))}`}
                    >
                        <ZhEnLabel zh={node.zh} en={node.en}></ZhEnLabel>
                    </Link>
                )}
                enabled={searchParamBitGet(2, "advf", searchParams) ? 1 : 0}
            >
            </RadioButtonGroup>
        </div>
    )
}
