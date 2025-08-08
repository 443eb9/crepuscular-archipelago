import { HTMLAttributes, ReactNode } from "react"

export default function OutlinedButton({ children, inv, ...props }: { children?: ReactNode, inv?: boolean } & HTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `border-2
                ${inv ? "bg-accent border-accent hover:border-dark-0 hover:dark:border-light-0" : "border-dark-0 dark:border-light-0 hover:bg-accent hover:border-accent"}
                ${props.className}`
            }
        >
            {children}
        </button>
    )
}
