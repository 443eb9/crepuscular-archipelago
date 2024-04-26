import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import OutlinedButton from "../common/outlined-button";

export default function NavButton({ title, href, className }: { title: String, href: Url, className?: string }) {
    return (
        <div className={`font-sh-serif font-bold ${className}`}>
            <Link href={href}>
                <OutlinedButton>
                    {title}
                </OutlinedButton>
            </Link>
        </div>
    );
}
