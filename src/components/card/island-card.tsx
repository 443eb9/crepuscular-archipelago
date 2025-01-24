"use client"

import OutlinedBox from "@/components/outlined-box"
import { IslandMeta } from "@/data/model"
import CardHeader from "./card-header"
import clsx from "clsx"
import CardBody from "./card-body"
import Text from "@/components/text"
import CardFooter from "./card-footer"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"
import LinkNoPrefetch from "../link-no-prefetch"

export default function IslandCard({ island, content, params, noLink }: { island: IslandMeta, content?: string, params: QueryParams, noLink?: boolean }) {
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
                        <LinkNoPrefetch
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
                    <div className="relative overflow-y-clip">
                        {!noLink && <LinkWrapper />}
                        <CardBody island={island} content={content} />
                    </div>
                </div>
                <CardFooter island={island} params={params} />
            </OutlinedBox>
        </div>
    )
}
