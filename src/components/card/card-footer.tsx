import { IslandMeta } from "@/data/model"
import { TbClockQuestion } from "react-icons/tb"
import { FaClock } from "react-icons/fa6"
import Text from "@/components/text"
import { QueryParams } from "@/data/search-param-util"
import TagsContainer from "../tags-container"

export default function CardFooter({ island, params }: { island: IslandMeta, params: QueryParams }) {
    return (
        <div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <TagsContainer island={island} params={params} />
                    {
                        island.date == undefined
                            ? <div className="flex items-center gap-1">
                                <TbClockQuestion className="text-lg"></TbClockQuestion>
                                <div className="font-bender">Future</div>
                            </div>
                            : <div className="flex items-center gap-1">
                                <FaClock />
                                <Text className="font-bender" suppressHydrationWarning>
                                    {(new Date(island.date)).toLocaleDateString()}
                                </Text>
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
