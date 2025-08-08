"use client"

import { TagData } from "@/data/model";
import TitleText from "./text/title-text";
import DiagLines from "./svg-deco/diag-lines";
import OutlinedButton from "./outlined-button";
import { processUrlSearchParams, searchParamsToUrl } from "@/data/search-param-util";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { bitEnabled, constructPath, toggleBit } from "@/data/utils";
import OutlinedBox from "./outlined-box";

export default function Tag({ tag }: { tag: TagData }) {
    const pathname = usePathname()
    const router = useRouter()
    const params = processUrlSearchParams(useSearchParams())

    return (
        <OutlinedButton
            className="relative flex"
            onClick={() => {
                const newParams = { ...params, tags: toggleBit(params.tags, tag.id) }
                router.push(constructPath(pathname, searchParamsToUrl(newParams)))
            }}
            inv={bitEnabled(params.tags, tag.id)}
        >
            <div className="">
                <div className="w-[6px] aspect-square bg-accent-0 ml-1 mt-2" />
            </div>
            <div className="pl-2 pr-4 py-1">
                <TitleText className="text-sm">{tag.name}</TitleText>
            </div>
            <DiagLines className="w-3" style={{ maskSize: "1000%", WebkitMaskSize: "1000%" }} />
        </OutlinedButton>
    )
}
