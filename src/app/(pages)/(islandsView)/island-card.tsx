"use client"

import OutlinedBox from "@/components/outlined-box";
import { IslandMeta } from "@/data/model";
import { useEffect, useRef, useState } from "react";
import CardHeader from "./card-header";
import clsx from "clsx";
import CardBody from "./card-body";
import Text from "@/components/text";
import CardFooter from "./card-footer";
import OutlinedButton from "@/components/outlined-button";
import { QueryParams, queryParamsToSearchParams } from "@/data/utils";
import Link from "next/link";

export default function IslandCard({ island, content, params }: { island: IslandMeta, content?: string, params: QueryParams }) {
    const container = useRef<HTMLDivElement>(null)
    const [expandState, setExpandState] = useState<boolean | undefined>()

    useEffect(() => {
        // TODO Image loads slow, but this solution is not elegant
        setTimeout(() => {
            if (container.current && container.current.clientHeight > 100 && island.ty == "note") {
                setExpandState(false)
            }
        }, 100)
    }, [])

    const CardMain = () => {
        return (
            <div className="relative pointer-events-auto">
                <OutlinedBox className={clsx(
                    "flex flex-col justify-between p-4 shadow-md gap-2",
                    { "border-dashed": island.date == undefined || island.isDeleted },
                    { "min-h-[200px]": !island.isDeleted }
                )}>
                    <div>
                        <CardHeader island={island} />
                        <div className={expandState == false ? "max-h-[200px] overflow-y-clip" : ""} ref={container}>
                            <CardBody island={island} content={content} />
                        </div>
                        <OutlinedButton
                            className={clsx(
                                "mt-2 w-full h-10 border-2 border-light-contrast dark:border-dark-contrast",
                                { "hidden": expandState == undefined }
                            )}
                            onClick={() => setExpandState(!expandState)}
                        >
                            {
                                expandState
                                    ? <Text className="">折叠</Text>
                                    : <Text className="">展开</Text>
                            }
                        </OutlinedButton>
                    </div>
                    <CardFooter island={island} />
                </OutlinedBox>
            </div>
        )
    }

    switch (island.ty) {
        case "article":
            return <Link href={`/island?id=${island.id}&${queryParamsToSearchParams(params)}`}><CardMain /></Link>
        case "achievement":
        case "note":
            return <CardMain />
    }
}
