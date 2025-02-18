import { frontendEndpoint } from "@/data/endpoints";
import { LicenseType } from "@/data/model";
import Image from "next/image";
import { HTMLAttributes } from "react";

export default function License({
    license, iconWidth, iconHeight, ...props
}: {
    license: LicenseType, iconWidth: number, iconHeight: number
} & HTMLAttributes<HTMLDivElement>) {
    if (license == "Repost") { return <></> }

    return (
        <div {...props}>
            {
                license
                    .split("_")
                    .map(seg =>
                        <Image
                            width={iconWidth}
                            height={iconHeight}
                            src={frontendEndpoint(`/images/ccicons/${seg.toLowerCase()}.svg`)}
                            alt={seg.toLowerCase()}
                        />
                    )
            }
        </div>
    )
}
