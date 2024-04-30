'use client';

import { TagData } from "@/data/model";
import Link from "next/link";
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";

export default function Tag({ tag, showAmount, className }: { tag: TagData, showAmount?: boolean, className?: string }) {
    const params = useSearchParams();
    const pathname = usePathname();

    return (
        <Link href={`${pathname}?${tryAppendTag(tag.id, params)}`}>
            <div className={`flex gap-1 border-neutral-900 dark:border-neutral-50 hover:bg-neutral-900 hover:dark:bg-neutral-50 hover:text-neutral-50 hover:dark:text-neutral-900 border-2 p-1 font-sh-serif text-xs font-bold cursor-pointer ${className}`}>
                <div className="">{tag.name}</div>
                {showAmount ? <div className="font-bender">{tag.amount}</div> : null}
            </div>
        </Link>
    );
}

function tryAppendTag(value: number, paramsRO: ReadonlyURLSearchParams) {
    let tags = Number.parseInt(paramsRO.get("tags") ?? "0") ^ (1 << value);
    const params = new URLSearchParams();
    params.set("tags", tags.toString());
    return params.toString();
}
