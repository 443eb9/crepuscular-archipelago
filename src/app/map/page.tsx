import IslandFilter from "@/components/island-filter";
import { NetworkFailable } from "@/components/network-failable";
import OutlinedBox from "@/components/outlined-box";
import Pagination from "@/components/pagination";
import { fetchAllTags, fetchIslandCount, fetchIslandMapMeta, fetchIslandMapRegionCenters, fetchIslandsMeta } from "@/data/api";
import { processSearchParams, RawSearchParams } from "@/data/search-param-util";
import IslandsMap from "./islands-map";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processSearchParams(await searchParams)
    const allTags = await fetchAllTags()
    const islandsMeta = await fetchIslandsMeta(params.page, params.len, params.tags, params.advf)
    const islandCount = await fetchIslandCount(params.tags, params.advf)
    const regionCenters = await fetchIslandMapRegionCenters(params.page)
    const islandMap = await fetchIslandMapMeta()

    if (!allTags.ok || !islandsMeta.ok || !islandCount.ok || !regionCenters.ok || !islandMap.ok) {
        return
    }

    return (
        <IslandsMap
            islands={islandsMeta.data}
            islandMapMeta={islandMap.data}
            regionCenters={regionCenters.data}
            totalIslands={islandCount.data.count}
            allTags={allTags.data}
            params={params}
        />
    )
}
