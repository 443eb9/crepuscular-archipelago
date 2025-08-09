import CornerDecoBox from "@/components/corner-deco-box"
import GiscusSection from "@/components/giscus-section"
import { NetworkFailable } from "@/components/network-failable"
import OutlinedBox from "@/components/outlined-box"
import RectDot from "@/components/rect-dot"
import SubIsland from "@/components/sub-island"
import ArrowRight from "@/components/svg-deco/arrow-right"
import CcIcons from "@/components/svg-deco/cc-icons"
import DiagLines from "@/components/svg-deco/diag-lines"
import Tag from "@/components/tag"
import AsciiText from "@/components/text/ascii-text"
import TitleText from "@/components/text/title-text"
import { fetchIsland, fetchIslandMeta } from "@/data/api"
import { processSearchParams, RawSearchParams, searchParamsToUrl } from "@/data/search-param-util"
import { constructPath, formatDate, formatLicense, formatState } from "@/data/utils"
import { Metadata } from "next"
import Link from "next/link"

export default async function Page({ searchParams, params }: { searchParams: Promise<RawSearchParams>, params: Promise<{ id: string }> }) {
    const id = Number.parseInt((await params).id)
    const urlParams = searchParamsToUrl(processSearchParams(await searchParams))

    return (
        <div className="flex flex-col gap-4">
            <NetworkFailable promise={fetchIslandMeta(id)} loading={<div></div>}>
                {island =>
                    <CornerDecoBox
                        decoSize={10}
                        decoGap={10}
                        lineThickness={2}
                        tr={{ node: <RectDot size={10} /> }}
                        bl={{ node: <RectDot size={10} /> }}
                        className="mt-6 min-h-[180px] flex"
                    >
                        <AsciiText className="absolute w-24 h-4 -top-4 pl-2 text-[8pt] font-bold bg-dark-0 dark:bg-light-0" inv>DESCRIPTION</AsciiText>
                        <div className="absolute flex flex-col items-center gap-2 bg-accent-0 w-6 py-2 -right-6 top-[10px]">
                            {formatLicense(island.license).map((license, i) => <CcIcons key={i} ty={license} className="w-4 aspect-square" inv />)}
                        </div>
                        <div className="flex flex-grow p-4 justify-between">
                            <div className="flex flex-col justify-between">
                                <div className="">
                                    <div className="flex h-8">
                                        <Link href={constructPath("/updates", urlParams)}>
                                            <ArrowRight className="w-8 h-8 -scale-x-100 -scale-y-75 mr-1 -ml-1"></ArrowRight>
                                        </Link>
                                        <div className="relative">
                                            <div className="flex justify-center items-center h-full aspect-square bg-dark-0 dark:bg-light-0">
                                                <AsciiText className="text-sm font-bold" inv>#</AsciiText>
                                            </div>
                                        </div>
                                        <div className="flex items-center w-14 h-full bg-accent-0">
                                            <AsciiText className="ml-2">{island.id}</AsciiText>
                                        </div>
                                    </div>
                                    <TitleText className="text-xl">{island.title}</TitleText>
                                </div>
                                <div className="flex gap-2">
                                    {island.tags.map((tag, i) => <Tag key={i} tag={tag} />)}
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                                <div className="flex gap-2">
                                    <DiagLines className="w-10 aspect-square" style={{ maskSize: "400%", WebkitMaskSize: "400%" }} />
                                    <div className="flex flex-col justify-between h-10">
                                        <RectDot size={6} cnt={4} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="bg-dark-0 dark:bg-light-0 px-2">
                                        <AsciiText className="font-bold text-center" inv>{formatState(island.ty, island.state)}</AsciiText>
                                    </div>
                                    <div className="bg-accent-0 px-2">
                                        <AsciiText className="text-center" inv>{formatDate(island.date ?? undefined)}</AsciiText>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CornerDecoBox>
                }
            </NetworkFailable>
            <NetworkFailable promise={fetchIsland(id)} loading={<div></div>}>
                {data =>
                    <OutlinedBox className="flex flex-col p-10">
                        {
                            data.content.map((subIsland, i) => <SubIsland key={i} subIsland={subIsland} />)
                        }
                    </OutlinedBox>
                }
            </NetworkFailable>
            <GiscusSection />
        </div>
    )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = Number.parseInt((await params).id)
    const meta = await fetchIslandMeta(id)
    const title = meta.ok ? meta.data.title : "Undefined Coordinate"
    return {
        title: `${title} - Crepuscular Archipelago`
    }
}
