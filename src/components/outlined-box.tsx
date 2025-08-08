import { HTMLAttributes } from "react"

export default function OutlinedBox({ ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`border-2 border-dark-0 dark:border-light-0 ${props.className}`}
        >
            {props.children}
        </div>
    )
}
