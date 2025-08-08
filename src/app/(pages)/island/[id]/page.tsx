import NetworkFailable from "@/components/network-failable"
import SubIsland from "@/components/sub-island"
import { fetchIsland, fetchIslandMeta } from "@/data/api"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const id = Number.parseInt((await params).id)

    return (
        <div className="">
            <NetworkFailable promise={fetchIslandMeta(id)} loading={<div></div>}>
                {data => <div className=""></div>}
            </NetworkFailable>
            <NetworkFailable promise={fetchIsland(id)} loading={<div></div>}>
                {data => data.content.map((subIsland, i) => <SubIsland key={i} subIsland={subIsland} />)}
            </NetworkFailable>
        </div>
    )
}
