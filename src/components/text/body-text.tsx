import { HTMLAttributes } from "react";
import Text from "./text";

export default function BodyText(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <Text {...props} font="font-sh-sans" />
}
