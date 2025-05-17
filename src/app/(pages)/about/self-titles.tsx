import NetworkErrorable from "@/components/network-errorable";
import Text from "@/components/text";
import { wrappedFetch } from "@/data/api";
import { frontendEndpoint } from "@/data/endpoints";
import { SelfTitleData } from "@/data/model";

export default async function SelfTitles() {
    const titles = await wrappedFetch<SelfTitleData[]>(frontendEndpoint("/self-titles.json"), "GET")

    return (
        <NetworkErrorable resp={titles}>
            {data => data.map(title =>
                <div className="flex gap-1 text-sm">
                    <Text style={{ opacity: 1 - title.progress }}>Future</Text>
                    <Text>{title.title}</Text>
                </div>
            )}
        </NetworkErrorable>
    )
}
