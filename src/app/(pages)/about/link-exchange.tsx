import EmphasizedBox from "@/components/decos/emphasized-box"
import NetworkErrorable from "@/components/network-errorable"
import { fetchLinkExchange } from "@/data/api"
import Image from "next/image"

export default async function LinkExchange() {
    const links = await fetchLinkExchange()

    return (
        <div className="w-full mt-4 grid-cols-1 grid md:grid-cols-2 gap-5">
            <NetworkErrorable resp={links}>
                {data =>
                    data.map((data, i) => {
                        return (
                            <div key={`link ${i}`} className="relative border-b-2 border-dark-contrast">
                                <div className="flex justify-between items-center">
                                    <a target="_blank" href={data.link} className="flex gap-5 items-center p-3">
                                        <EmphasizedBox
                                            className="w-12 h-12 p-1"
                                            thickness={3}
                                            length={10}
                                        >
                                            <Image src={data.avatar} alt="" unoptimized></Image>
                                        </EmphasizedBox>
                                        <div className="flex flex-col" style={{ maxWidth: "calc(100% - 80px)" }}>
                                            <div className="font-sh-sans text-small">{data.name}</div>
                                            <div className="text-light-dark-neutral font-sh-sans text-small">{data.message}</div>
                                        </div>
                                    </a>
                                    <div className="mr-4 italic font-bold text-4xl font-bender text-light-unfocused dark:text-dark-unfocused">
                                        #{i}
                                    </div>
                                </div>
                                <div className="absolute flex items-center overflow-clip w-full h-1">
                                    <Image className="scale-150 blur-3xl" src={data.avatar} alt="" unoptimized></Image>
                                </div>
                            </div>
                        )
                    })
                }
            </NetworkErrorable>
        </div>
    )
}
