import { fetchIslandMapMeta, fetchIslandMapRegionCenters, fetchIslandsMeta } from "@/data/api";
import { processQueryParams, RawSearchParams } from "@/data/utils";
import IslandsGrid from "./islands-grid";
import NetworkErrorable from "@/components/network-errorable";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const islandMapMeta = await fetchIslandMapMeta()

    return (
        <div>
            <NetworkErrorable resp={islandMapMeta}>
                {
                    async meta => {
                        const islands = await fetchIslandsMeta(params.page, meta.perPageRegions, params.tags, params.advf)
                        return (
                            <NetworkErrorable resp={islands}>
                                {async islands => {
                                    const regionCenters = await fetchIslandMapRegionCenters(params.page % meta.pageCnt)
                                    return (
                                        <NetworkErrorable resp={regionCenters}>
                                            {centers => <IslandsGrid islands={islands} islandMapMeta={meta} regionCenters={centers} page={params.page} />}
                                        </NetworkErrorable>
                                    )
                                }}
                            </NetworkErrorable>
                        )
                    }
                }
            </NetworkErrorable>
        </div>
    )
}
