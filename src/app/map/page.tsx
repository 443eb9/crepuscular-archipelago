import { fetchAllTags, fetchIslandCount, fetchIslandMapMeta, fetchIslandMapRegionCenters, fetchIslandsMeta } from "@/data/api"
import { processQueryParams, RawSearchParams } from "@/data/utils"
import NetworkErrorable from "@/components/network-errorable"
import IslandsMap from "./islands-map"

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const islandMapMeta = await fetchIslandMapMeta()
    const totalIslands = await fetchIslandCount(params.tags, params.advf)
    const allTags = await fetchAllTags()

    return (
        <NetworkErrorable resp={islandMapMeta}>
            {
                async meta => {
                    const islands = await fetchIslandsMeta(params.page, meta.perPageRegions, params.tags, params.advf)
                    const regionCenters = await fetchIslandMapRegionCenters(params.page % meta.pageCnt)
                    return (
                        <NetworkErrorable resp={islands}>
                            {islands =>
                                <NetworkErrorable resp={regionCenters}>
                                    {centers =>
                                        <NetworkErrorable resp={totalIslands}>
                                            {totalIslands =>
                                                <NetworkErrorable resp={allTags}>
                                                    {allTags => <IslandsMap
                                                        islands={islands}
                                                        islandMapMeta={meta}
                                                        regionCenters={centers}
                                                        totalIslands={totalIslands.count}
                                                        allTags={allTags}
                                                        params={params}
                                                    />}
                                                </NetworkErrorable>}
                                        </NetworkErrorable>
                                    }
                                </NetworkErrorable>}
                        </NetworkErrorable>
                    )
                }
            }
        </NetworkErrorable>
    )
}
