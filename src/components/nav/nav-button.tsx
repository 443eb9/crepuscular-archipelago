import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import OutlinedButton from "../common/outlined-button";

export default function NavButton({ title, href }: { title: String, href: Url }) {
    return (
        <div className="w-20 h-10 font-sh-serif font-bold">
            <Link href={href}>
                <OutlinedButton>
                    {title}
                </OutlinedButton>
            </Link>
        </div>
    );
}
