import { frontendEndpoint } from "@/data/endpoints";
import { HTMLAttributes } from "react";
import SvgDeco from "./svg-deco";

export default function DiagLines(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <SvgDeco url={frontendEndpoint("/images/diag-lines.svg")} {...props} />
}
