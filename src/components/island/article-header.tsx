import { FaClock } from "react-icons/fa6";
import OutlinedBox from "../common/outlined-box";
import { IslandMeta, IslandTag } from "@/data/island";
import Tag from "../common/tag";

export default function ArticleHeader({ meta, tags }: { meta: IslandMeta, tags: IslandTag[] }) {
    return (
        <OutlinedBox className="flex flex-col p-5 gap-1">
            <h1 className="font-bender text-4xl font-bold">{`# ${meta.id}`}</h1>
            <h1 className="font-sh-serif text-2xl font-bold">{meta.title}</h1>
            <div className="flex gap-1">
                {meta.tags.map((tag) => <Tag tag={tags[tag]}></Tag>)}
            </div>
            <div className="flex items-center gap-2">
                <FaClock></FaClock>
                <div className="font-bender">{meta.date}</div>
            </div>
        </OutlinedBox>
    );
}
