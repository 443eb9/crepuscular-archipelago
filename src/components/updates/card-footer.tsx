import { IslandMeta } from "@/data/model";
import Tag from "../common/tag";
import SpTag from "../common/sp-tag";
import { TbClockQuestion } from "react-icons/tb";
import { FaClock } from "react-icons/fa6";

export default function CardFooter({ island }: { island: IslandMeta }) {
    return (
        <div className="flex justify-between">
            <div className="flex items-center gap-1">
                {
                    island.tags.map(tag => (
                        <Tag tag={tag} key={tag.id}></Tag>
                    ))
                }
                {island.wip && <SpTag content="WIP"></SpTag>}
                {!island.is_original && <SpTag content="非原创"></SpTag>}
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
    );
}
