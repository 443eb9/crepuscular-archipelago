import { Links } from "@/data/link-exchange-data";
import EndpointDottedSegment from "../common/decos/endpoint-dotted-segment";
import OutlinedBox from "../common/outlined-box";
import EmphasizedBox from "../common/decos/emphasized-box";
import ZhEnLabel from "../common/zh-en-label";

export default function LinkExchange() {
    return (
        <OutlinedBox className="w-full p-2 pb-4">
            <ZhEnLabel
                zh="友链"
                en="Link Exchange"
                className="flex-col"
                zhClassName="font-sh-serif text-3xl font-bold"
                enClassName="text-medium italic "
            ></ZhEnLabel>
            <EndpointDottedSegment thickness={1} dotSize={4} style="solid"></EndpointDottedSegment>
            {
                Links.map((data, i) => {
                    return (
                        <div
                            key={`link ${i}`}
                            className="">
                            <div className="flex justify-between items-center">
                                <LinkElement
                                    avatar={data.avatar}
                                    name={data.name}
                                    link={data.link}
                                ></LinkElement>
                                <div className="mr-4 italic font-bold text-4xl font-bender text-light-unfocused dark:text-dark-unfocused">
                                    #{i}
                                </div>
                            </div>
                            <EndpointDottedSegment
                                thickness={1}
                                dotSize={4}
                                style={
                                    i == Links.length - 1 ? "solid" : "dashed"
                                }>
                            </EndpointDottedSegment>
                        </div>
                    );
                })
            }
        </OutlinedBox>
    );
}

function LinkElement({ avatar, name, link }: { avatar: string, name: string, link: string }) {
    return (
        <a target="_blank" href={link} className="flex gap-5 items-center p-3">
            <EmphasizedBox
                className="w-12 h-12 p-1"
                thickness={3}
                length={10}
            >
                <img src={avatar} alt="" draggable={false} />
            </EmphasizedBox>
            <div className="font-sh-sans text-small">{name}</div>
        </a>
    );
}
