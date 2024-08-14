'use client'

import Link from "next/link";
import OutlinedButton from "../common/interact/outlined-button";
import { searchParamReset } from "@/data/search-param-util";
import { useSearchParams } from "next/navigation";

export default function ResetFilters() {
    return (
        <Link href={`/updates?${searchParamReset(["tags", "advf", "page"], useSearchParams())}`}>
            <OutlinedButton className="w-full h-8 font-bender text-center mt-2 text-medium">Reset All</OutlinedButton>
        </Link>
    );
}
