import { IslandMeta } from "@/data/model"
import DiagLines from "@/components/decos/diag-lines"
import Markdown from "@/components/markdown"
import Text from "@/components/text"
import clsx from "clsx"

export default function CardBody({ island, content }: { island: IslandMeta, content?: string }) {
    return (
        <div>
            {
                island.ty != "achievement"
                && <DiagLines className="absolute right-5 size-10" scale="300%"></DiagLines>
            }
            <div className="flex flex-col" style={{ maxWidth: "calc(100% - 50px)" }}>
                <Text elem="h1" className="text-xl mb-1">{island.title}</Text>
                <Text elem="h2" className="italic text-md mb-1">{island.subtitle}</Text>
            </div>
            <div className="flex mb-2">
                <div className="w-20 h-1 bg-light-contrast dark:bg-dark-contrast" />
                <div className="w-4 h-1 bg-light-contrast dark:bg-dark-contrast ml-3" />
                <div className="w-2 h-1 bg-light-contrast dark:bg-dark-contrast ml-3" />
            </div>
            {
                island.ty == "article" &&
                <Text className={clsx(
                    { "opacity-50 italic": !island.desc }
                )} style={{ width: "calc(100% - 80px)" }}>
                    {island.desc ?? "No description."}
                </Text>
            }
            {
                content &&
                <Markdown body={content} />
            }
        </div>
    )
}
