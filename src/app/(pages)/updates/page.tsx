"use client"

import IslandCard from "@/components/cards/island-card"
import NetworkFailable from "@/components/cards/network-failable"
import { fetchIslandsMeta } from "@/data/api"
import { processUrlSearchParams } from "@/data/search-param-util"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"

export default function Page() {
    const params = processUrlSearchParams(useSearchParams())

    return (
        <div className="p-10">
            <div className="flex flex-col-reverse gap-12 max-w-[540px]">
                <NetworkFailable swrResp={useSWR(params, fetchIslandsMeta)} loading={<div></div>}>
                    {
                        data => data.map((island, i) => <IslandCard key={i} island={island} />)
                    }
                </NetworkFailable>
            </div>
        </div>
    )
}
