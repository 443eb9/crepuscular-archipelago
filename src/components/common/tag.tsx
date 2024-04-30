'use client';

import { TagData } from "@/data/model";
import clsx from "clsx";
import Link from "next/link";
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";

export default function Tag({ tag, showAmount, className }: { tag: TagData, showAmount?: boolean, className?: string }) {
    const params = useSearchParams();
    const pathname = usePathname();

    const filter = Number.parseInt(params.get("tags") ?? "0");
    const isEnabled = (filter & (1 << tag.id)) != 0;

    return (
        <Link href={`${pathname}?${tryAppendTag(tag.id, filter)}`}>
            <div className={clsx(
                `flex gap-1 border-neutral-900 dark:border-neutral-50 hover:bg-neutral-900 hover:dark:bg-neutral-50 hover:text-neutral-50 hover:dark:text-neutral-900 border-2 p-1 font-sh-serif text-xs font-bold cursor-pointer ${className}`,
                {
                    "bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900": isEnabled,
                }
            )}>
                <div className="">{tag.name}</div>
                {showAmount ? <div className="font-bender">{tag.amount}</div> : null}
            </div>
        </Link>
    );
}

function tryAppendTag(value: number, filter: number) {
    let tags = filter ^ (1 << value);
    const params = new URLSearchParams();
    params.set("tags", tags.toString());
    return params.toString();
}
