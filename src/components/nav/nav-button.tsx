import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";

export default function NavButton({ title, href }: { title: String, href: Url }) {
    return (
        <button className="w-20 h-10 font-sh-serif font-bold border-neutral-900 dark:border-neutral-50 border-2">
            {title}
            <Link href={href}></Link>
        </button>
    );
}
