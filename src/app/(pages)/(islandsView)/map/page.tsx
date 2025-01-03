import { fetchIslandCount, fetchIslandMapMeta, fetchIslandMapRegionCenters, fetchIslandsMeta } from "@/data/api";
import { processQueryParams, RawSearchParams } from "@/data/utils";
import IslandsGrid from "./islands-grid";
import NetworkErrorable from "@/components/network-errorable";
import { IslandMapMeta, IslandMapRegionCenters, IslandMeta } from "@/data/model";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const islandMapMeta = await fetchIslandMapMeta()
    const totalIslands = await fetchIslandCount(params.tags, params.advf)

    const PageWrapper = (props: { islands: IslandMeta[], islandMapMeta: IslandMapMeta, regionCenters: IslandMapRegionCenters, totalIslands: number }) => {
        return (
            <div className="w-[100vw] h-[100vh]">
                <IslandsGrid
                    islands={props.islands}
                    islandMapMeta={props.islandMapMeta}
                    regionCenters={props.regionCenters}
                    currentPage={params.page}
                    totalPages={Math.ceil(props.totalIslands / props.islandMapMeta.perPageRegions)}
                />
            </div>
        )
    }

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
                                            {totalIslands => <PageWrapper
                                                islands={islands}
                                                islandMapMeta={meta}
                                                regionCenters={centers}
                                                totalIslands={totalIslands.count}
                                            />}
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
