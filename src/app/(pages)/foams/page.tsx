import NetworkErrorable from "@/components/network-errorable";
import Pagination from "@/components/pagination";
import { fetchFoams, fetchFoamsCount } from "@/data/api";
import { processQueryParams, RawSearchParams } from "@/data/search-param-util";
import FoamsGrid from "./foams-grid";
import ContentWrapper from "@/components/content-wrapper";

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processQueryParams(await searchParams)
    const count = await fetchFoamsCount()
    const foams = await fetchFoams(params.page, params.len)

    return (
        <ContentWrapper className="flex-col gap-2">
            <NetworkErrorable resp={foams}>
                {data => <FoamsGrid foams={data} />}
            </NetworkErrorable>
            <NetworkErrorable resp={count}>
                {data => <Pagination total={data.count} buttonSize={48} params={params} />}
            </NetworkErrorable>
        </ContentWrapper>
    )
}
