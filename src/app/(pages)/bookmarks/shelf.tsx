import DiagLines from "@/components/decos/diag-lines"
import EndpointDottedSegment from "@/components/decos/endpoint-dotted-segment"
import LinkNoPrefetch from "@/components/link-no-prefetch"
import { Bookmarks } from "@/data/model"

export default function Shelf({ bookmarks }: { bookmarks: Bookmarks }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between">
                <div className="flex gap-2 items-center">
                    <div className="h-full w-3 bg-light-contrast dark:bg-dark-contrast"></div>
                    <h2 className="font-sh-sans text-2xl">{bookmarks.category}</h2>
                </div>
                <DiagLines scale="400%" className="w-10 aspect-square"></DiagLines>
            </div>
            <div className="flex flex-col">
                {
                    bookmarks.content.map((data, i) =>
                        <LinkNoPrefetch key={i} href={data.link} target="_blank" className="flex items-center">
                            <div className="flex md:gap-2 font-sh-sans flex-col md:flex-row">
                                <div className="">{data.title}</div>
                                <div className="text-light-dark-neutral italic">{`//`} {data.comment}</div>
                            </div>
                            <div className="border-t-1 flex flex-grow mx-4 min-w-5 border-dashed"></div>
                            <div className="font-bender text-light-dark-neutral italic">#{i}</div>
                        </LinkNoPrefetch>
                    )
                }
            </div>
            <EndpointDottedSegment thickness={1} dotSize={5} style="solid"></EndpointDottedSegment>
        </div>
    )
}
