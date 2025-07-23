"use client"

import { Island } from "@/data/model"
import SubIslandBody from "@/components/sub-Island-body"
import OutlinedBox from "@/components/outlined-box"

export default function ArticleBody({ body, noOutline }: { body: Island, noOutline?: boolean }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            {
                noOutline
                    ? body.content.map(i => <SubIslandBody subIsland={i} />)
                    : <OutlinedBox className="px-5 py-8">
                        {
                            body.content.map(i => <SubIslandBody subIsland={i} />)
                        }
                    </OutlinedBox>
            }
        </div>
    )
}
