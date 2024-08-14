'use client'

import Link from "next/link";
import RadioButtonGroup from "../common/interact/radio-button-group";
import ToggleExclude from "./toggle-exclude";
import { searchParamBitGet, searchParamBitSet } from "@/data/search-param-util";
import { useSearchParams } from "next/navigation";

export default function AdvancedFilters() {
    const searchParams = useSearchParams();

    return (
        <div className="">
            <ToggleExclude></ToggleExclude>
            <h2 className="font-bender font-bold text-small">Logical Operator</h2>
            <RadioButtonGroup
                className="flex justify-around"
                labels={[
                    { k: "And &&", v: false },
                    { k: "Or ||", v: true },
                ].map((node, _) =>
                    <Link key={node.k} href={`/updates?${searchParamBitSet(2, node.v, "advf", searchParams)}`}>
                        <div className="font-bender text-medium">{node.k}</div>
                    </Link>
                )}
                enabled={searchParamBitGet(2, "advf", searchParams) ? 1 : 0}
            >
            </RadioButtonGroup>
        </div>
    );
}
