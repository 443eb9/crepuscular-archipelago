'use client';

import Link from "next/link";
import OutlinedButton from "../common/interact/outlined-button";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import OutlinedBox from "../common/outlined-box";
import clsx from "clsx";

export default function PageSwitcher({ islandCount, currentPage, currentLength }: { islandCount: number, currentPage: number, currentLength: number }) {
    const searchParams = useSearchParams();
    
    if (islandCount == 0) {
        return (
            <div className="text-2xl font-bender">
                No islands meeting the criteria were found. :(
            </div>
        );
    }

    const totalPage = Math.ceil(islandCount / currentLength);
    const pages = Array.from(Array(totalPage).keys());

    return (
        <OutlinedBox className="flex content-between w-full p-3 gap-3 border-x-0 border-dashed">
            {
                pages.map((index) =>
                    <SwitcherButton
                        key={index}
                        target={index}
                        params={searchParams}
                        className={clsx(
                            { "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast": index == currentPage, }
                        )}
                    >
                    </SwitcherButton>
                )
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
