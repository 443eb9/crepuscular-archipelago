'use client';

import Link from "next/link";
import OutlinedButton from "../common/outlined-button";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import OutlinedBox from "../common/outlined-box";
import clsx from "clsx";

export default function PageSwitcher({ islandCount, currentPage, currentLength }: { islandCount: number, currentPage: number, currentLength: number }) {
    const totalPage = Math.ceil(islandCount / currentLength);
    const pages = Array.from(Array(totalPage).keys());
    const searchParams = useSearchParams();

    return (
        <OutlinedBox className="flex content-between w-full p-3 gap-3 border-x-0 border-dashed">
            {
                pages.map((index) =>
                    <SwitcherButton
                        key={index}
                        target={index}
                        params={searchParams}
                        className={clsx(
                            { "bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900": index == currentPage, }
                        )}>
                    </SwitcherButton>)
            }
        </OutlinedBox>
    );
}

function SwitcherButton({ target, params, className }: { target: number, params: ReadonlyURLSearchParams, className?: string }) {
    return (
        <Link href={`/updates?${changeSearchParam(target, params).toString()}`}>
            <OutlinedButton className={`w-10 h-10 font-bender font-bold text-2xl ${className}`}>
                {target}
            </OutlinedButton>
        </Link>
    );
}

function changeSearchParam(target: number, ro: ReadonlyURLSearchParams) {
    const params = new URLSearchParams(ro);
    params.set("page", target.toString());
    return params;
}
