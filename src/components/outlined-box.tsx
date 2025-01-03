import { HTMLAttributes, ReactNode } from "react"

export default function OutlinedBox({ children, ...props }: { children?: ReactNode } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`border-2 border-light-contrast dark:border-dark-contrast ${props.className}`}
        >
            {children}
        </div>
    )
}
