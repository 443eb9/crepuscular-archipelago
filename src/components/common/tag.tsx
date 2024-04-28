import { ContentTag } from "@/data/card";
import Link from "next/link";

export default function Tag({ tag, showAmount, className }: { tag: ContentTag, showAmount?: boolean, className?: string }) {
    return (
        <Link href={''}>
            <div className={`flex gap-1 border-neutral-900 dark:border-neutral-50 border-2 p-1 font-sh-serif text-xs font-bold cursor-pointer ${className}`}>
                <div className="">{tag.name}</div>
                {showAmount ? <div className="font-bender">{tag.amount}</div> : null}
            </div>
        </Link>
    );
}
