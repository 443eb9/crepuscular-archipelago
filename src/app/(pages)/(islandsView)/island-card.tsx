"use client"

import OutlinedBox from "@/components/outlined-box";
import { IslandMeta } from "@/data/model";
import { useEffect, useRef, useState } from "react";
import CardHeader from "./card-header";
import clsx from "clsx";
import CardBody from "./card-body";
import Text from "@/components/text";
import CardFooter from "./card-footer";

export default function IslandCard({ island, content }: { island: IslandMeta, content?: string }) {
    const container = useRef(null)
    const [expandState, setExpandState] = useState<boolean | undefined>()

    useEffect(() => {
        if (container.current == null) {
            return
        }
        const div: HTMLDivElement = container.current
        if (div.clientHeight > 100) {
            console.log("AAAAAAAAAAAAAA")
            setExpandState(false)
        }
    }, [])

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
                    <button
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
                    </button>
                </div>
                <CardFooter island={island} />
            </OutlinedBox>
        </div>
    )
}
