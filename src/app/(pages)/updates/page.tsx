import IslandCard from "@/components/island-card"
import NetworkFailable from "@/components/network-failable"
import EndDecoLine from "@/components/end-deco-line"
import IslandFilter from "@/components/island-filter"
import Pagination from "@/components/pagination"
import RectDot from "@/components/rect-dot"
import AsciiText from "@/components/text/ascii-text"
import { fetchAllTags, fetchIslandCount, fetchIslandsMeta } from "@/data/api"
import { processSearchParams, RawSearchParams } from "@/data/search-param-util"
import AnimLoadingBar from "@/components/anim/anim-loading-bar"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Updates - Crepuscular Archipelago",
}

export default async function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = processSearchParams(await searchParams)

    return (
        <div className="flex flex-grow gap-10 px-10 pt-4">
            <div className="flex flex-col flex-grow gap-8">
                <div className="flex flex-col-reverse flex-grow gap-12">
                    <NetworkFailable
                        promise={fetchIslandsMeta(params.page, params.len, params.tags, params.advf)}
                        loading={<AnimLoadingBar className="h-10"><AsciiText className="italic px-2" inv>Fetching islands list...</AsciiText></AnimLoadingBar>}
                    >
                        {
                            data => data.length == 0
                                ? <div className="opacity-50">
                                    <AsciiText className="flex font-bold italic text-2xl">No island satisfies the condition found :(</AsciiText>
                                    <div className="flex">
                                        <div className="w-20 h-[5px] bg-dark-0 dark:bg-light-0" />
                                        <div className="flex gap-1 ml-2">
                                            <RectDot size={5} cnt={5} />
                                        </div>
                                    </div>
                                </div>
                                : data.map((island, i) => <IslandCard key={i} island={island} />)
                        }
                    </NetworkFailable>
                </div>
                <EndDecoLine deco={<RectDot size={10} />} decoSize={10} lineThickness={1} decoGap={5} lineStyle="dashed" />
                <div className="flex gap-2">
                    <NetworkFailable
                        promise={fetchIslandCount(params.tags, params.advf)}
                        loading={<AnimLoadingBar className="h-10"><AsciiText className="italic px-2" inv>Fetching islands count...</AsciiText></AnimLoadingBar>}
                    >
                        {data => <Pagination className="w-10" total={data.count} />}
                    </NetworkFailable>
                </div>
            </div>
            <div className="relative max-w-80 min-w-80">
                <div className="fixed max-w-80 min-w-80">
                    <NetworkFailable promise={fetchAllTags()} loading={<IslandFilter allTags={[]} />}>
                        {data => <IslandFilter allTags={data} />}
                    </NetworkFailable>
                </div>
            </div>
        </div>
    )
}
