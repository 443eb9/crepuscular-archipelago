import { HTMLAttributes } from "react";

export default function Text({ font, inv, ...props }: { font: string, inv?: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`${inv ? "text-light-0 dark:text-dark-0" : "text-dark-0 dark:text-light-0"} ${font} ` + props.className}
        >
            {props.children}
        </div>
    )
}
