import { HTMLAttributes } from "react";

export default function Checkbox({ enabled, ...props }: { enabled: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`flex items-center gap-2 ${props.className}`}>
            <div className={
                `size-4 border-2 font-bold cursor-pointer
                ${enabled ? "bg-accent-0 border-accent-0 hover:border-dark-0 hover:dark:border-light-0" : "border-dark-0 dark:border-light-0 hover:bg-accent-0"}`
            }></div>
            {props.children}
        </div>
    )
}
