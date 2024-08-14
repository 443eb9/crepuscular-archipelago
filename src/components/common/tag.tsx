'use client';

import { TagData } from "@/data/model";
import clsx from "clsx";
import Link from "next/link";
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";

export default function Tag({ tag, showAmount, className }: { tag: TagData, showAmount?: boolean, className?: string }) {
    const paramsRO = useSearchParams();

    const filter = Number.parseInt(paramsRO.get("tags") ?? "0");
    const isEnabled = (filter & (1 << tag.id)) != 0;

    return (
        <Link href={`/updates?${tryAppendTag(tag.id, filter, paramsRO)}`}>
            <div className={clsx(
                `flex gap-1 border-light-contrast dark:border-dark-contrast hover:bg-light-contrast hover:dark:bg-dark-contrast hover:text-dark-contrast hover:dark:text-light-contrast border-2 p-1 font-sh-serif text-xs font-bold cursor-pointer ${className}`,
                {
                    "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast": isEnabled,
                }
            )}>
                <div className="">{tag.name}</div>
                {showAmount ? <div className="font-bender">{tag.amount}</div> : null}
            </div>
        </Link>
    );
}

export function tryAppendTag(value: number, filter: number, ro: ReadonlyURLSearchParams) {
    let tags = filter ^ (1 << value);
    const params = new URLSearchParams(ro);
    params.set("tags", tags.toString());
    return params.toString();
}
