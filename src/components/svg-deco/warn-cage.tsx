import { frontendEndpoint } from "@/data/endpoints";
import { HTMLAttributes } from "react";
import SvgDeco from "./svg-deco";

export default function WarnCage(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <SvgDeco
        url={frontendEndpoint("/images/warn-cage.svg")}
        {...props}
    />
}
