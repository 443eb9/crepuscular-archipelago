import { frontendEndpoint } from "@/data/endpoints";
import { LicenseType } from "@/data/model";
import Image from "next/image";
import { HTMLAttributes } from "react";
import LinkNoPrefetch from "./link-no-prefetch";

export default function License({
    license, iconWidth, iconHeight, ...props
}: {
    license: LicenseType, iconWidth: number, iconHeight: number
} & HTMLAttributes<HTMLDivElement>) {
    if (license == "Repost") { return <></> }

    return (
        <div
            {...props}
            className={`relative ${props.className}`}
        >
            <LinkNoPrefetch
                className="absolute w-full h-full"
                href={`https://creativecommons.org/licenses/${license.replaceAll("CC_", "").toLowerCase().replaceAll("_", "-")}/4.0/`}
                target="_blank"
            />
            {
                license
                    .split("_")
                    .map((seg, index) =>
                        <Image
                            key={index}
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
