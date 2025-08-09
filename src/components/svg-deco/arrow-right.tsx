import { frontendEndpoint } from "@/data/endpoints";
import { HTMLAttributes } from "react";
import SvgDeco from "./svg-deco";

export default function ArrowRight(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <SvgDeco
        url={frontendEndpoint("/images/arrow-right.svg")}
        {...props}
    />
}
