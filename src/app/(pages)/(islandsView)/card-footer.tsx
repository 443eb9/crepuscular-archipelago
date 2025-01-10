import { IslandMeta } from "@/data/model"
import { TbClockQuestion } from "react-icons/tb"
import { FaClock } from "react-icons/fa6"
import Tag from "@/components/tag"
import { useSearchParams } from "next/navigation"

export default function CardFooter({ island }: { island: IslandMeta }) {
    const searchParams = new URLSearchParams(useSearchParams())

    return (
        <div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <div className="">
                        <div className="flex flex-wrap items-center gap-1">
                            {
                                island.tags.map(tag => (
                                    <Tag tag={tag} key={tag.id} searchParams={searchParams}></Tag>
                                ))
                            }
                            {/* {island.date == undefined && <SpTag content="WIP"></SpTag>}
                        {!island.is_original && <SpTag content="非原创"></SpTag>} */}
                        </div>
                    </div>
                    {
                        island.date == undefined
                            ? <div className="flex items-center gap-1">
                                <TbClockQuestion className="text-lg"></TbClockQuestion>
                                <div className="font-bender">Future</div>
                            </div>
                            : <div className="flex items-center gap-1">
                                <FaClock></FaClock>
                                <div className="font-bender" suppressHydrationWarning>
                                    {(new Date(island.date)).toLocaleDateString()}
                                </div>
                            </div>
                    }
                </div>
            </div>
            {
                !island.isDeleted && !island.date != undefined &&
                <div className="">
                    <div className="absolute w-2 h-24 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                    <div className="absolute w-8 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 right-36"></div>
                    <div className="absolute w-36 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                </div>
            }
        </div>
    )
}
