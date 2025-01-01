import Link from "next/link"
import { ReactNode } from "react"

export default function UnderlinedLink({ href, className, children }: { href: string, className?: string, children?: ReactNode }) {
    return (
        <Link href={href} className={`underline ${className}`} target="_blank">{children}</Link>
    )
}
