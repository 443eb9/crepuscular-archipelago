import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import OutlinedButton from "../outlined-button";

export default function NavButton({ title, href, className }: { title: String, href: Url, className?: string }) {
    return (
        <div className={`font-sh-serif font-bold ${className}`}>
            <Link href={href}>
                <OutlinedButton className="w-full h-full">
                    {title}
                </OutlinedButton>
            </Link>
        </div>
    );
}
