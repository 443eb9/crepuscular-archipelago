import { IslandMeta } from "@/data/model";
import OutlinedBox from "../common/outlined-box";
import clsx from "clsx";
import { ReactNode } from "react";
import CardHeader from "./card-header";
import CardBody from "./card-body";
import CardFooter from "./card-footer";

export default function IslandCard({ island, content, params }: { island: IslandMeta, content?: ReactNode, params: URLSearchParams }) {
    return (
        <div className="relative">
            <OutlinedBox className={clsx(
                "flex flex-col justify-between w-full p-4 shadow-md gap-2 min-h-[200px]",
                { "border-dashed": island.wip }
            )}>
                <div>
                    <CardHeader island={island}></CardHeader>
                    <div className="max-h-[250px] overflow-clip">
                        <CardBody island={island} params={params} content={content}></CardBody>
                    </div>
                </div>
                <CardFooter island={island}></CardFooter>
            </OutlinedBox>
            <div className={clsx("", { "hidden": island.wip })}>
                <div className="absolute w-2 h-24 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                <div className="absolute w-8 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 right-36"></div>
                <div className="absolute w-36 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
            </div>
        </div>
    );
}
