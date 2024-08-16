import EmphasizedBox from "../common/decos/emphasized-box";
import { ErrorResponse, get, Response } from "@/data/requests";
import NetworkErrorFallback from "../common/network-error-fallback";
import { LinkExchangeData } from "@/data/model";

export default async function LinkExchange() {
    const links: Response<LinkExchangeData[]> = await get("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/friends.json");
    let data;

    if (!(links instanceof ErrorResponse)) {
        data = links.data;
    }

    // My pc can't access raw.githubusercontent.com :(
    if (process.env.NODE_ENV != "production") {
        data = [
            {
                "avatar": "https://raw.githubusercontent.com/443eb9/443eb9/main/avatar.webp",
                "name": "Crepuscular Archipelago",
                "link": "https://443eb9.dev",
                "message": "我是我自己朋友没问题吧（逃 我是凑字数的我是凑字数的我是凑字数的"
            }
        ]
    }

    return (
        <div className="w-full mt-4 grid-cols-1 grid md:grid-cols-2 gap-5">
            {
                data == undefined
                    ? <NetworkErrorFallback error={links as ErrorResponse}></NetworkErrorFallback>
                    : data.map((data, i) => {
                        return (
                            <div key={`link ${i}`} className="relative border-b-2 border-dark-contrast">
                                <div className="flex justify-between items-center">
                                    <a target="_blank" href={data.link} className="flex gap-5 items-center p-3">
                                        <EmphasizedBox
                                            className="w-12 h-12 p-1"
                                            thickness={3}
                                            length={10}
                                        >
                                            <img src={data.avatar} alt="" draggable={false} />
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
                                    <img className="scale-150 blur-3xl" src={data.avatar} alt="" draggable={false}></img>
                                </div>
                            </div>
                        );
                    })
            }
        </div>
    );
}
