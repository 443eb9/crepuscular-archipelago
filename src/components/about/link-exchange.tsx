import { fetchLinkExchangeList } from "@/data/api";
import EmphasizedBox from "../common/decos/emphasized-box";
import { ErrorResponse } from "@/data/requests";
import NetworkErrorFallback from "../common/network-error-fallback";

export default async function LinkExchange() {
    const links = await fetchLinkExchangeList();

    return (
        <div className="w-full mt-4 grid-cols-1 grid md:grid-cols-2 gap-5">
            {
                links instanceof ErrorResponse
                    ? <NetworkErrorFallback error={links}></NetworkErrorFallback>
                    : links.data.map((data, i) => {
                        return (
                            <div key={`link ${i}`} className="border-b-2 border-light-contrast dark:border-dark-contrast">
                                <div className="flex justify-between items-center">
                                    <a target="_blank" href={data.link} className="flex gap-5 items-center p-3">
                                        <EmphasizedBox
                                            className="w-12 h-12 p-1"
                                            thickness={3}
                                            length={10}
                                        >
                                            <img src={data.avatar} alt="" draggable={false} />
                                        </EmphasizedBox>
                                        <div className="flex flex-col">
                                            <div className="font-sh-sans text-small">{data.name}</div>
                                            <div className="text-light-dark-neutral font-sh-sans text-small">{data.message}</div>
                                        </div>
                                    </a>
                                    <div className="mr-4 italic font-bold text-4xl font-bender text-light-unfocused dark:text-dark-unfocused">
                                        #{i}
                                    </div>
                                </div>
                            </div>
                        );
                    })
            }
        </div>
    );
}
