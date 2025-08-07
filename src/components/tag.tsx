import { TagData } from "@/data/model";
import TitleText from "./text/title-text";
import DiagLines from "./svg-deco/diag-lines";

export default function Tag({ tag }: { tag: TagData }) {
    return (
        <div className="relative flex border-2 border-dark-0 dark:border-light-0">
            <div className="">
                <div className="w-[6px] aspect-square bg-accent ml-1 mt-2" />
            </div>
            <div className="pl-2 pr-4 py-1">
                <TitleText className="text-sm">{tag.name}</TitleText>
            </div>
            <DiagLines className="w-3" style={{ maskSize: "1200%", WebkitMaskSize: "1200%" }} />
        </div>
    )
}
