import LinkNoPrefetch from "@/components/link-no-prefetch";
import NetworkErrorable from "@/components/network-errorable";
import Text from "@/components/text";
import { fetchLinkExchange } from "@/data/api";
import LinkExchange from "./link-exchange";
import ContentWrapper from "@/components/content-wrapper";
import Image from "next/image";

export default async function Page() {
    const linkExchange = await fetchLinkExchange()

    return (
        <ContentWrapper className="flex flex-col gap-4">
            <Text elem="h1" className="text-4xl">友链</Text>
            <NetworkErrorable resp={linkExchange}>
                {data => <LinkExchange links={data} />}
            </NetworkErrorable>
            <Text>
                想加上自己的可以来<LinkNoPrefetch href={"https://github.com/443eb9/aetheric-cargo"}><u>这里</u></LinkNoPrefetch> ヾ(≧▽≦*)o
            </Text>
            <div className="flex items-center">
                <Text>想随机去到其他人的网站？</Text>
                <LinkNoPrefetch href="https://www.travellings.cn/go.html" target="_blank">
                    <Image
                        src="https://www.travellings.cn/assets/logo.gif"
                        alt="开往"
                        width={100}
                        height={100}
                    />
                </LinkNoPrefetch>
            </div>
        </ContentWrapper>
    )
}
