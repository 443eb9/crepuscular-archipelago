import NetworkFailable from "@/components/network-failable"
import OutlinedBox from "@/components/outlined-box"
import SubIsland from "@/components/sub-island"
import { fetchIsland, fetchIslandMeta } from "@/data/api"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const id = Number.parseInt((await params).id)

    return (
        <div className="flex flex-col gap-2">
            <NetworkFailable promise={fetchIslandMeta(id)} loading={<div></div>}>
                {data => <OutlinedBox className=""></OutlinedBox>}
            </NetworkFailable>
            <NetworkFailable promise={fetchIsland(id)} loading={<div></div>}>
                {data =>
                    <OutlinedBox className="flex flex-col p-10">
                        {
                            data.content.map((subIsland, i) => <SubIsland key={i} subIsland={subIsland} />)
                        }
                    </OutlinedBox>
                }
            </NetworkFailable>
        </div>
    )
}
