import { IslandMeta, IslandType } from "@/data/model"
import { ReactNode } from "react"
import Link from "next/link"
import { searchParamToString } from "@/data/search-param-util"
import DiagLines from "@/components/decos/diag-lines"
import { useSearchParams } from "next/navigation"

export default function CardBody({ island, content }: { island: IslandMeta, content?: ReactNode }) {
    const searchParams = new URLSearchParams(useSearchParams())

    const body = (
        <div>
            {
                island.ty != IslandType.Achievement
                && <DiagLines className="absolute right-5 size-10" scale="300%"></DiagLines>
            }
            <div className="flex flex-col" style={{ maxWidth: "calc(100% - 50px)" }}>
                <h1 className="font-sh-serif font-bold text-xl mb-1">{island.title}</h1>
                <h2 className="font-sh-serif font-bold italic text-md mb-1">{island.subtitle}</h2>
            </div>
            <div className="flex mb-2">
                <div className="w-20 h-1 bg-light-contrast dark:bg-dark-contrast"></div>
                <div className="w-4 h-1 bg-light-contrast dark:bg-dark-contrast ml-3"></div>
                <div className="w-2 h-1 bg-light-contrast dark:bg-dark-contrast ml-3"></div>
            </div>
            <p className="font-sh-sans text-ellipsis overflow-hidden line-clamp-6" style={{ width: "calc(100% - 80px)" }}>{island.desc}</p>
            {content}
        </div>
    )

    if (island.ty == IslandType.Article) {
        return (
            <Link href={`/island?id=${island.id}${searchParams.size == 0 ? "" : `&${searchParams}`}`}>
                {body}
            </Link>
        )
    } else {
        return body
    }
}
