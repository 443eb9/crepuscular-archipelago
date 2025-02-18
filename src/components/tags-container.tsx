import { IslandMeta } from "@/data/model";
import { QueryParams } from "@/data/search-param-util";
import Tag from "./tag";
import SpTag from "./sp-tag";

export default function TagsContainer({ island, params }: { island: IslandMeta, params: QueryParams }) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            {
                island.tags.map(tag => (
                    <Tag tag={tag} key={tag.id} params={params} />
                ))
            }
            {island.date == undefined && <SpTag title="WIP" />}
        </div>
    )
}
