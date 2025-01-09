"use client"

import OutlinedBox from "@/components/outlined-box";
import { IslandMeta } from "@/data/model";
import { useEffect, useRef, useState } from "react";
import CardHeader from "./card-header";
import clsx from "clsx";
import CardBody from "./card-body";
import Text from "@/components/text";
import CardFooter from "./card-footer";

export default function IslandCard({ island }: { island: IslandMeta }) {
    const container = useRef(null)
    const [expandState, setExpandState] = useState<boolean | undefined>()

    useEffect(() => {
        if (container.current == null) {
            return
        }
        const div: HTMLDivElement = container.current
        if (div.offsetHeight > 249) {
            setExpandState(false)
        }
    }, [])

    return (
        <div className="relative pointer-events-auto">
            <OutlinedBox className={clsx(
                "flex flex-col justify-between p-4 shadow-md gap-2",
                { "border-dashed": island.date == undefined || island.is_deleted },
                { "min-h-[200px]": !island.is_deleted }
            )}>
                <div>
                    <CardHeader island={island}></CardHeader>
                    <div className={
                        clsx("",
                            { "max-h-[250px] overflow-clip": expandState == false }
                        )
                    } ref={container}>
                        <CardBody island={island} />
                    </div>
                    <button
                        className={
                            clsx("mt-2 w-full h-10 border-2 border-light-contrast dark:border-dark-contrast",
                                { "hidden": expandState == undefined }
                            )
                        }
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
            {
                !island.is_deleted &&
                <div className={clsx("", { "hidden": island.date == undefined })}>
                    <div className="absolute w-2 h-24 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                    <div className="absolute w-8 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 right-36"></div>
                    <div className="absolute w-36 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                </div>
            }
        </div>
    )
}
