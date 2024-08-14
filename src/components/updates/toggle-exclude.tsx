'use client';

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { tryAppendTag } from "../common/tag";
import Toggle from "../common/toggle";

export default function ToggleExclude() {
    const paramsRO = useSearchParams();
    const tagsFilter = Number.parseInt(paramsRO.get("tags") ?? "0");
    const isEnabled = (tagsFilter & (1 << 31)) != 0;

    return (
        <Link href={`/updates?${tryAppendTag(31, tagsFilter, paramsRO).toString()}`}>
            <Toggle enabled={isEnabled}>
                <div className="font-bender">Exclude Mode</div>
            </Toggle>
        </Link>
    );
}
