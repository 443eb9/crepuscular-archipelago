'use client';

import { TagData } from "@/data/model";
import { searchParamBitXor, searchParamReset } from "@/data/search-param-util";
import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Tag({ tag, showAmount, className }: { tag: TagData, showAmount?: boolean, className?: string }) {
    const paramsRO = useSearchParams();

    const filter = Number.parseInt(paramsRO.get("tags") ?? "0");
    const isEnabled = (filter & (1 << tag.id)) != 0;

    return (
        <Link href={`/updates?${searchParamReset(["page"], searchParamBitXor(tag.id, "tags", paramsRO)).toString()}`}>
            <div className={clsx(
                `border-light-contrast dark:border-dark-contrast
                hover:bg-light-contrast hover:dark:bg-dark-contrast
                hover:text-dark-contrast hover:dark:text-light-contrast
                flex gap-1 border-2 p-1 font-sh-serif text-xs text-nowrap font-bold cursor-pointer h-7 items-center ${className}`,
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
