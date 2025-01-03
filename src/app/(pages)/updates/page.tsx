import { fetchIslandMapMeta, fetchIslandsMeta } from "@/data/api";
import { processQueryParams, RawSearchParams } from "@/data/utils";
import IslandsGrid from "./islands-grid";
import NetworkErrorable from "@/components/network-errorable";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const islands = await fetchIslandsMeta(params.page, params.len, params.tags, params.advf)
    const islandMap = await fetchIslandMapMeta()

    return (
        <div>
            <NetworkErrorable resp={islands}>
                {islands => <NetworkErrorable resp={islandMap}>
                    {islandMap => <IslandsGrid islands={islands} islandMap={islandMap} />}
                </NetworkErrorable>}
            </NetworkErrorable>
        </div>
    )
}
