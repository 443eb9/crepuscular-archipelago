import { fetchIslandsMeta } from "@/data/api";
import { processQueryParams, RawSearchParams } from "@/data/utils";
import IslandsGrid from "./islands-grid";
import NetworkErrorable from "@/components/network-errorable";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const islands = await fetchIslandsMeta(params.page, params.len, params.tags, params.advf)

    return (
        <div>
            <NetworkErrorable resp={islands}>
                {
                    data => <IslandsGrid islands={data} />
                }
            </NetworkErrorable>
        </div>
    )
}
