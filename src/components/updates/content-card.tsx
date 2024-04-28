import { FaClock } from "react-icons/fa6";
import Link from "next/link";
import Tag from "../common/tag";
import { CardData, CardTag, fetchAllTags } from "@/data/card";
import clsx from "clsx";
import { RiMedal2Line } from "react-icons/ri";
import OutlinedBox from "../common/outlined-box";

export default async function ContentCard({ card }: { card: CardData }) {
    const tagsLookup: { [name: string]: CardTag } = Object.fromEntries((await fetchAllTags()).map((tag) => [tag.name, tag]));

    return (
        <div className="relative">
            <OutlinedBox className={clsx(
                "flex flex-col justify-between w-full p-4 shadow-md gap-2",
                { "h-72": !card.is_achievement }
            )}>
                {
                    card.is_achievement
                        ? <CardMain card={card}></CardMain>
                        : <Link href={''}><CardMain card={card}></CardMain></Link>
                }
                <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                        {
                            card.tags.map((tag, i) => (
                                <Tag tag={tagsLookup[tag]} key={tag + i}></Tag>
                            ))
                        }
                    </div>
                    <div className="flex items-center gap-1">
                        <FaClock></FaClock>
                        <div className="font-bender">{card.date}</div>
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

function CardMain({ card }: { card: CardData }) {
    return (
        <div>
            {card.is_achievement && <AchievementCardHeader></AchievementCardHeader>}
            <h1 className="font-sh-serif font-bold leading-loose text-xl">{card.title}</h1>
            <div className="flex">
                <div className="w-20 h-1 bg-neutral-900 dark:bg-neutral-50"></div>
                <div className="w-4 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
                <div className="w-2 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
            </div>
            <p className="font-sh-sans text-ellipsis overflow-hidden line-clamp-6">{card.preview}</p>
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
