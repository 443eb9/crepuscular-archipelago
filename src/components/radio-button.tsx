import { HTMLAttributes, ReactNode } from "react"

export default function RadioButton({ enabled, ...props }: { enabled: boolean } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`flex items-center gap-2 ${props.className}`}>
            <div className={
                `size-3 border-2 font-bold cursor-pointer rotate-45
                ${enabled ? "bg-accent-0 border-accent-0" : "border-dark-0 dark:border-light-0 hover:bg-accent-0"}`
            }></div>
            {props.children}
        </div>
    )
}
