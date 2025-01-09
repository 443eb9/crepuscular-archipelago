import { HTMLAttributes, ReactNode } from "react"

export default function OutlinedButton({ children, ...props }: { children?: ReactNode } & HTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `flex justify-center items-center
                border-light-contrast dark:border-dark-contrast 
                hover:dark:bg-dark-contrast hover:text-dark-contrast hover:border-2 border-2
                hover:bg-light-contrast hover:dark:text-light-contrast ${props.className}`
            }
        >
            {children}
        </button>
    )
}
