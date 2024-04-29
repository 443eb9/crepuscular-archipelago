import { FaClock } from "react-icons/fa6";
import OutlinedBox from "../common/outlined-box";
import { IslandMeta, IslandTag } from "@/data/island";
import Tag from "../common/tag";
import Link from "next/link";

export default function ArticleHeader({ meta, tags }: { meta: IslandMeta, tags: IslandTag[] }) {
    return (
        <OutlinedBox className="flex justify-between p-5">
            <div className="flex flex-col gap-1">
                <Link href={"/updates"} className="font-argon font-bold">
                    &lt; $ cd .._
                </Link>
                <h1 className="font-bender text-4xl font-bold">{`# ${meta.id}`}</h1>
                <h1 className="font-sh-serif text-2xl font-bold">{meta.title}</h1>
                <div className="flex gap-1">
                    {meta.tags.map((tag) => <Tag tag={tags[tag]} key={tags[tag].name}></Tag>)}
                </div>
                <div className="flex items-center gap-2">
                    <FaClock></FaClock>
                    <div className="font-bender">{meta.date}</div>
                </div>
            </div>
            <div className="bg-dark-diag-lines bg-repeat w-20 dark:invert" style={{ backgroundSize: "300%" }}></div>
        </OutlinedBox>
    );
}
