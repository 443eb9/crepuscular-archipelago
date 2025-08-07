import { frontendEndpoint } from "@/data/endpoints";
import { HTMLAttributes } from "react";
import SvgDeco from "./svg-deco";

export default function CcIcons({ ty, ...props }: { ty: "by" | "cc" | "nc" | "nd" | "sa" | "zero", inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <SvgDeco url={frontendEndpoint(`/images/ccicons/${ty}.svg`)} {...props} />
}
