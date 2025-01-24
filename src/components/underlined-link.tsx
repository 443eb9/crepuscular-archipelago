import { ReactNode } from "react"
import LinkNoPrefetch from "./link-no-prefetch"

export default function UnderlinedLink({ href, className, children }: { href: string, className?: string, children?: ReactNode }) {
    return (
        <LinkNoPrefetch href={href} className={`underline ${className}`} target="_blank">{children}</LinkNoPrefetch>
    )
}
