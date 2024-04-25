import { ArticleCardDataRaw } from "@/data/article-card";
import Tag from "../common/tag";
import { FaClock } from "react-icons/fa6";

export default function ArticleCard({ card }: { card: ArticleCardDataRaw }) {
    return (
        <div className="relative cursor-pointer">
            <div className="flex flex-col justify-between w-full h-72 p-4 border-neutral-900 dark:border-neutral-50 border-2 shadow-md">
                <div className="flex flex-col">
                    <h1 className="font-sh-serif font-bold leading-loose text-xl">{card.title}</h1>
                    <div className="flex">
                        <div className="w-20 h-1 bg-neutral-900 dark:bg-neutral-50"></div>
                        <div className="w-4 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
                        <div className="w-2 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
                    </div>
                    <p className="font-sh-sans text-ellipsis overflow-hidden line-clamp-6">{card.preview}</p>
                </div>
                <div className="flex justify-between">
                    <div className="flex items-center gap-1 font-sh-serif text-xs font-bold">
                        <div className="font-bender font-normal text-base">Tags:</div>
                        {
                            card.tags.map((tag, i) => (
                                <Tag tag={tag} key={tag + i}></Tag>
                            ))
                        }
                    </div>
                    <div className="flex items-center">
                        <FaClock className="mr-1"></FaClock>
                        <div className="font-bender">Posted on {card.date}</div>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="absolute w-2 h-24 bg-neutral-50 -bottom-4 -right-4"></div>
                <div className="absolute w-8 h-2 bg-neutral-50 -bottom-4 right-36"></div>
                <div className="absolute w-36 h-2 bg-neutral-50 -bottom-4 -right-4"></div>
            </div>
        </div>
    );
}
