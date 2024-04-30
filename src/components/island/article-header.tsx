import { FaClock } from "react-icons/fa6";
import OutlinedBox from "../common/outlined-box";
import { IslandMeta, TagData } from "@/data/model";
import Tag from "../common/tag";
import Link from "next/link";
import DiagLines from "../common/decos/diag-lines";

export default function ArticleHeader({ meta }: { meta: IslandMeta }) {
    return (
        <OutlinedBox className="flex justify-between p-5">
            <div className="flex flex-col gap-1">
                <Link href={"/updates"} className="font-argon font-bold">
                    &lt; $ cd .._
                </Link>
                <h1 className="font-bender text-4xl font-bold">{`# ${meta.id}`}</h1>
                <h1 className="font-sh-serif text-2xl font-bold">{meta.title}</h1>
                <div className="flex gap-1">
                    {meta.tags.map((tag) => <Tag tag={tag} key={tag.id}></Tag>)}
                </div>
                <div className="flex items-center gap-2">
                    <FaClock></FaClock>
                    <div className="font-bender">{new Date(meta.date).toLocaleDateString()}</div>
                </div>
            </div>
            <DiagLines className="w-10 md:w-20" scale="300%"></DiagLines>
        </OutlinedBox>
    );
}
