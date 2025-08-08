import { HTMLAttributes, ReactNode } from "react"

export default function OutlinedButton({ inv, ...props }: { inv?: boolean } & HTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `border-2
                ${inv ? "bg-accent-0 border-accent-0 hover:border-dark-0 hover:dark:border-light-0" : "border-dark-0 dark:border-light-0 hover:bg-accent-0 hover:border-accent-0"}
                ${props.className}`
            }
        >
            {props.children}
        </button>
    )
}
