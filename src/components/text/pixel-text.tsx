import { HTMLAttributes } from "react";
import Text from "./text";

export default function PixelText(props: { inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return <Text {...props} font="font-pixel" />
}
