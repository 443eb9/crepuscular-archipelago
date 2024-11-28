'use client'

import { IslandMeta } from "@/data/model";
import OutlinedBox from "../common/outlined-box";
import clsx from "clsx";
import { ReactNode, useEffect, useRef, useState } from "react";
import CardHeader from "./card-header";
import CardBody from "./card-body";
import CardFooter from "./card-footer";
import OutlinedButton from "../common/interact/outlined-button";
import ZhEnLabel from "../common/zh-en-label";

export default function IslandCard({ island, content, params }: { island: IslandMeta, content?: ReactNode, params: URLSearchParams }) {
    const container = useRef(null);
    const [isExpandable, setExpandable] = useState(false);
    const [isExpanded, setExpanded] = useState(false);

    useEffect(() => {
        if (container.current == null) {
            return;
        }
        const div: HTMLDivElement = container.current;
        if (div.offsetHeight > 249) {
            setExpandable(true);
        }
    }, []);

    return (
        <div className="relative">
            <OutlinedBox className={clsx(
                "flex flex-col justify-between p-4 shadow-md gap-2",
                { "border-dashed": island.date == undefined },
                { "min-h-[200px]": !island.is_deleted }
            )}>
                {
                    island.is_deleted && <div className="font-bender font-bold text-xl">Access Denied</div>
                }
                {
                    !island.is_deleted &&
                    <div>
                        <CardHeader island={island}></CardHeader>
                        <div className={
                            clsx("",
                                { "max-h-[250px] overflow-clip": !isExpanded }
                            )
                        } ref={container}>
                            <CardBody island={island} params={params} content={content}></CardBody>
                        </div>
                        <OutlinedButton
                            className={
                                clsx("mt-2 w-full h-10 border-2 border-light-contrast dark:border-dark-contrast",
                                    { "hidden": !isExpandable }
                                )
                            }
                            onClick={() => setExpanded(!isExpanded)}
                        >
                            {
                                isExpanded
                                    ? <ZhEnLabel zh="折叠" en="Fold"></ZhEnLabel>
                                    : <ZhEnLabel zh="展开" en="Expand"></ZhEnLabel>
                            }
                        </OutlinedButton>
                    </div>
                }
                {!island.is_deleted && <CardFooter island={island}></CardFooter>}
            </OutlinedBox>
            <div className={clsx("", { "hidden": island.date == undefined })}>
                <div className="absolute w-2 h-24 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                <div className="absolute w-8 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 right-36"></div>
                <div className="absolute w-36 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
            </div>
        </div>
    );
}
