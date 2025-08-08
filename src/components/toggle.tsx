import { ReactNode } from "react"

export default function Toggle({ enabled, children, className }: { enabled: boolean, children: ReactNode, className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={
                `size-4 border-2 font-bold cursor-pointer
                ${enabled ? "bg-accent border-accent hover:border-dark-0 hover:dark:border-light-0" : "border-dark-0 dark:border-light-0 hover:bg-accent"}`
            }>
            </div>
            {children}
        </div>
    )
}
