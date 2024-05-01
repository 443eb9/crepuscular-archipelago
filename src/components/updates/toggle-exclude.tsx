'use client';

import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { tryAppendTag } from "../common/tag";

export default function ToggleExclude() {
    const paramsRO = useSearchParams();
    const tagsFilter = Number.parseInt(paramsRO.get("tags") ?? "0");
    const isEnabled = (tagsFilter & (1 << 31)) != 0;

    return (
        <Link href={`/updates?${tryAppendTag(31, tagsFilter, paramsRO).toString()}`}>
            <div className="flex items-center gap-2">
                <div className={clsx(
                    `size-4 border-neutral-900 dark:border-neutral-50 hover:bg-neutral-900 hover:dark:bg-neutral-50 hover:text-neutral-50 hover:dark:text-neutral-900 border-2 font-bold cursor-pointer`,
                    {
                        "bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900": isEnabled,
                    }
                )}></div>
                <div className="font-bender">Exclude Mode</div>
            </div>
        </Link>
    );
}
