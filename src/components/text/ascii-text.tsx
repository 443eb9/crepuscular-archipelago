import { HTMLAttributes } from "react";
import Text from "./text";

export default function AsciiText(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <Text {...props} font="font-bender" />
}
