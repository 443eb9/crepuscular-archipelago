import { IslandMeta } from "@/data/model"
import { QueryParams } from "@/data/search-param-util"
import TagsContainer from "../tags-container"
import License from "../license"
import IslandState from "../island-state"

export default function CardFooter({ island, params }: { island: IslandMeta, params: QueryParams }) {
    return (
        <div>
            <div className="flex flex-col gap-2">
                <TagsContainer island={island} params={params} />
                <div className="flex justify-between">
                    <License
                        className="flex gap-1 dark:invert"
                        license={island.license}
                        iconWidth={20}
                        iconHeight={20}
                    />
                    <IslandState date={island.date} state={island.state} />
                </div>
            </div>
            {
                (island.state == "finished" || island.state == "longTermProject" || island.state == "deprecated") &&
                <div className="">
                    <div className="absolute w-2 h-24 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                    <div className="absolute w-8 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 right-36"></div>
                    <div className="absolute w-36 h-2 bg-light-contrast dark:bg-dark-contrast -bottom-4 -right-4"></div>
                </div>
            }
        </div>
    )
}
