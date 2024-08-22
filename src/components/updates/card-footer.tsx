import { IslandMeta, IslandType } from "@/data/model";
import Tag from "../common/tag";
import SpTag from "../common/sp-tag";
import { TbClockQuestion } from "react-icons/tb";
import { FaClock } from "react-icons/fa6";
import License from "./license";

export default function CardFooter({ island }: { island: IslandMeta }) {
    return (
        <div className="">
            <div className="flex justify-between">
                <div className="">
                    <div className="flex flex-wrap items-center gap-1">
                        {
                            island.tags.map(tag => (
                                <Tag tag={tag} key={tag.id}></Tag>
                            ))
                        }
                        {island.wip && <SpTag content="WIP"></SpTag>}
                        {!island.is_original && <SpTag content="非原创"></SpTag>}
                        <div className="hidden md:block">
                            {
                                island.is_original && island.ty != IslandType.Achievement && <License></License>
                            }
                        </div>
                    </div>
                </div>
                {
                    island.wip
                        ? <div className="flex items-center gap-1">
                            <TbClockQuestion className="text-lg"></TbClockQuestion>
                            <div className="font-bender">Future</div>
                        </div>
                        : <div className="flex items-center gap-1">
                            <FaClock></FaClock>
                            <div
                                className="font-bender"
                                suppressHydrationWarning
                            >
                                {new Date(island.date).toLocaleDateString()}
                            </div>
                        </div>
                }
            </div>
            <div className="block md:hidden mt-1">
                {
                    island.is_original && island.ty != IslandType.Achievement && <License></License>
                }
            </div>
        </div>
    );
}
