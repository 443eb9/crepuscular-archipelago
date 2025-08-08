import { Island, SubIslandData } from "@/data/model";
import { decrypt } from "@/data/utils";
import { useEffect, useState } from "react";
import Markdown from "./markdown";

export default function IslandBody({ island }: { island: Island }) {
    function SubIslandBody({ subIsland }: { subIsland: SubIslandData }) {
        const [decrypted, setDecrypted] = useState<string | undefined>()

        useEffect(() => {
            if (!subIsland.isEncrypted) { return; }

            const key = localStorage.getItem("islandKey") ?? undefined
            const iv = localStorage.getItem("islandIv") ?? undefined

            if (key && iv) {
                try {
                    setDecrypted(decrypt(subIsland.content, key, iv))
                } catch (err) {
                    // pass
                }
            }
        }, [])

        if (decrypted) {
            // return (
            //     <OutlinedBox className="border-dashed p-2">
            //         <div className="flex flex-col">
            //             <div className="flex items-center gap-2">
            //                 <IoLockOpenOutline />
            //                 <Text className="font-bender" noFont>Encrypted Content</Text>
            //             </div>
            //             <Markdown body={decrypted} />
            //         </div>
            //     </OutlinedBox>
            // )
            return <div className=""></div>
        } else if (!subIsland.isEncrypted) {
            return <Markdown body={subIsland.content} />
        } else {
            // return (
            //     <OutlinedBox className="border-dashed p-2">
            //         <div className="flex flex-col">
            //             <div className="flex items-center gap-2">
            //                 <IoLockClosedOutline />
            //                 <Text className="font-bender" noFont>Encrypted Content</Text>
            //             </div>
            //             <Markdown body={subIsland.content} />
            //         </div>
            //     </OutlinedBox>
            // )
            return <div className=""></div>
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {
                island.content.map((subIsland, i) => <SubIslandBody key={i} subIsland={subIsland} />)
            }
        </div>
    )
}
