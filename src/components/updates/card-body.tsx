import { IslandMeta, IslandType } from "@/data/model";
import { ReactNode } from "react";
import DiagLines from "../common/decos/diag-lines";
import Link from "next/link";

export default function CardBody({ island: island, content, params }: { island: IslandMeta, content?: ReactNode, params: URLSearchParams }) {
    const body = (
        <div>
            <h2 className=
                "absolute font-bender font-bold leading-none pl-2 py-[2px] text-[10px] w-20 -top-1 left-3 text-dark-contrast dark:text-light-contrast bg-light-contrast dark:bg-dark-contrast"
            >{`# ${island.id}`}</h2>
            {
                island.ty == IslandType.Article && <DiagLines className="absolute right-5 size-10" scale="300%"></DiagLines>
            }
            <div className="flex flex-col">
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
    );

    if (island.ty == IslandType.Article) {
        return (
            <Link href={`/island?id=${island.id}&${params.toString()}`}>
                {body}
            </Link>
        );
    } else {
        return body;
    }
}
