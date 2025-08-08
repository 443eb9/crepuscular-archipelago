"use client"

import IslandCard from "@/components/cards/island-card"
import NetworkFailable from "@/components/cards/network-failable"
import IslandFilter from "@/components/island-filter"
import { fetchIslandsMeta } from "@/data/api"
import { processUrlSearchParams } from "@/data/search-param-util"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"

export default function Page() {
    const params = processUrlSearchParams(useSearchParams())

    return (
        <div className="flex gap-10 p-10">
            <div className="flex flex-col-reverse gap-12">
                <NetworkFailable swrResp={useSWR(params, fetchIslandsMeta)} loading={<div></div>}>
                    {
                        data => data.map((island, i) => <IslandCard key={i} island={island} />)
                    }
                </NetworkFailable>
            </div>
            <div className="relative max-w-80 min-w-80">
                <div className="fixed max-w-80 min-w-80">
                    <IslandFilter />
                </div>
            </div>
        </div>
    )
}
