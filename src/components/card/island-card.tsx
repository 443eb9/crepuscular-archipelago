"use client"

import OutlinedBox from "@/components/outlined-box"
import { IslandMeta } from "@/data/model"
import { useEffect, useRef, useState } from "react"
import CardHeader from "./card-header"
import clsx from "clsx"
import CardBody from "./card-body"
import Text from "@/components/text"
import CardFooter from "./card-footer"
import OutlinedButton from "@/components/outlined-button"
import Link from "next/link"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"

export default function IslandCard({ island, content, params, noLink }: { island: IslandMeta, content?: string, params: QueryParams, noLink?: boolean }) {
    const container = useRef<HTMLDivElement>(null)
    const [expandState, setExpandState] = useState<boolean | undefined>()

    useEffect(() => {
        // TODO Image loads slow, but this solution is not elegant
        setTimeout(() => {
            if (container.current && container.current.clientHeight > 249 && island.ty == "note") {
                setExpandState(false)
            } else {
                setExpandState(undefined)
            }
        }, 1000)
    }, [island.id])

    if (island.isDeleted) {
        return (
            <OutlinedBox className="border-dashed">
                <Text className="font-bender font-bold text-2xl px-4 py-2" noFont>Access Denied</Text>
            </OutlinedBox>
        )
    }

    const LinkWrapper = () => {
        switch (island.ty) {
            case "article":
                if (!noLink) {
                    return (
                        <Link
                            className="absolute w-full h-full"
                            href={`/island?id=${island.id}&${queryParamsToSearchParams(params)}`}
                        />
                    )
                }
            case "achievement":
            case "note":
                return <></>
        }
    }

    return (
        <div className="relative pointer-events-auto">
            <OutlinedBox className={clsx(
                "flex flex-col justify-between p-4 shadow-md gap-2",
                { "border-dashed": island.date == undefined || island.isDeleted },
                { "min-h-[200px]": !island.isDeleted }
            )}>
                <div>
                    <CardHeader island={island} />
                    <div className={clsx("relative overflow-y-clip", { "max-h-[250px]": !expandState })} ref={container}>
                        {!noLink && <LinkWrapper />}
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
                <CardFooter island={island} params={params} />
            </OutlinedBox>
        </div>
    )
}
