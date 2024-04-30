import { FaClock } from "react-icons/fa6";
import Link from "next/link";
import Tag from "../common/tag";
import { IslandMeta, IslandType, TagData } from "@/data/model";
import clsx from "clsx";
import { RiMedal2Line } from "react-icons/ri";
import OutlinedBox from "../common/outlined-box";

export default async function IslandCard({ card, tags }: { card: IslandMeta, tags: TagData[] }) {
    return (
        <div className="relative">
            <OutlinedBox className=
                "flex flex-col justify-between w-full p-4 shadow-md gap-2"
            >
                {
                    card.ty == IslandType.Achievement
                        ? <CardMain card={card}></CardMain>
                        : <Link href={`/island?id=${card.id}`}><CardMain card={card}></CardMain></Link>
                }
                <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                        {
                            tags.map(tag => (
                                <Tag tag={tag} key={tag.id}></Tag>
                            ))
                        }
                    </div>
                    <div className="flex items-center gap-1">
                        <FaClock></FaClock>
                        <div className="font-bender">{new Date(card.date).toLocaleDateString()}</div>
                    </div>
                </div>
            </OutlinedBox>
            <div className="">
                <div className="absolute w-2 h-24 bg-neutral-900 dark:bg-neutral-50 -bottom-4 -right-4"></div>
                <div className="absolute w-8 h-2 bg-neutral-900 dark:bg-neutral-50 -bottom-4 right-36"></div>
                <div className="absolute w-36 h-2 bg-neutral-900 dark:bg-neutral-50 -bottom-4 -right-4"></div>
            </div>
        </div>
    );
}

function CardMain({ card }: { card: IslandMeta }) {
    return (
        <div>
            {card.ty == IslandType.Achievement
                ? <AchievementCardHeader></AchievementCardHeader>
                : <div className="absolute right-5 bg-dark-diag-lines w-10 h-10 dark:invert" style={{ backgroundSize: "300%" }}></div>}
            <h1 className="font-sh-serif font-bold leading-loose text-xl">{card.title}</h1>
            <div className="flex">
                <div className="w-20 h-1 bg-neutral-900 dark:bg-neutral-50"></div>
                <div className="w-4 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
                <div className="w-2 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
            </div>
            <p className="font-sh-sans text-ellipsis overflow-hidden line-clamp-6">{card.desc}</p>
        </div>
    );
}

function AchievementCardHeader() {
    return (
        <div className="flex items-center justify-center">
            <div className="hidden md:flex">
                <div className="bg-neutral-900 dark:bg-neutral-50 w-2 h-3 mr-2"></div>
                <div className="bg-neutral-900 dark:bg-neutral-50 w-6 h-3 mr-3"></div>
                <div className="bg-neutral-900 dark:bg-neutral-50 w-12 h-3 mr-4"></div>
            </div>
            <RiMedal2Line className="text-4xl"></RiMedal2Line>
            <h1 className="font-bender font-bold text-lg">Achievement Unlocked!</h1>
            <div className="hidden md:flex">
                <div className="bg-neutral-900 dark:bg-neutral-50 w-12 h-3 ml-4"></div>
                <div className="bg-neutral-900 dark:bg-neutral-50 w-6 h-3 ml-3"></div>
                <div className="bg-neutral-900 dark:bg-neutral-50 w-2 h-3 ml-2"></div>
            </div>
        </div>
    );
}
