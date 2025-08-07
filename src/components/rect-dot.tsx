import { HTMLAttributes } from "react";

export default function RectDot({ size, inv, cnt, ...props }: { size: number, inv?: boolean, cnt?: number } & HTMLAttributes<HTMLDivElement>) {
    return Array.from(Array(cnt ?? 1).keys().map(i => <div
        {...props}
        key={i}
        className={`${inv ? "dark:bg-dark-0 bg-light-0" : "bg-dark-0 dark:bg-light-0"} ` + props.className}
        style={{
            ...props.style,
            width: `${size}px`,
            aspectRatio: 1,
        }}
    />))
}
