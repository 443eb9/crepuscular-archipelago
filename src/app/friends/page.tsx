import { fetchLinkExchange } from "@/data/api"
import { Metadata } from "next"
import FriendsClientPageWrapper from "./friends-client-page-wrapper"
import { NetworkFailable } from "@/components/network-failable"

export const metadata: Metadata = {
    title: "Friends - Crepuscular Archipelago",
}

export default async function Page() {
    const linkExchange = fetchLinkExchange()

    return (
        <NetworkFailable promise={linkExchange} loading={<div></div>}>
            {data => <FriendsClientPageWrapper linkExchange={data} />}
        </NetworkFailable>
    )
}
