import { HTMLAttributes } from "react";
import Text from "./text";

export default function TitleText(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <Text {...props} className={"font-bold " + props.className} font="font-sh-serif" />
}
