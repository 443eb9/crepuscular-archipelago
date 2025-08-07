import { HTMLAttributes } from "react";

export default function SvgDeco({ url, tilling, inv, ...props }: { url: string, tilling?: boolean, inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`${inv ? "dark:bg-dark-0 bg-light-0" : "bg-dark-0 dark:bg-light-0"} ` + props.className}
            style={{
                mask: `url(${url}) ${tilling ? "repeat" : "no-repeat"} center`,
                WebkitMask: `url(${url}) ${tilling ? "repeat" : "no-repeat"} center`,
                maskSize: "contain",
                ...props.style,
            }}
        />
    )
}