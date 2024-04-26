import Link from "next/link";

export default function Tag({ tag, className }: { tag: string, className?: string }) {
    return (
        <div className={`border-neutral-900 dark:border-neutral-50 border-2 p-1 font-sh-serif text-xs font-bold cursor-pointer ${className}`}>
            <Link href={''}>{tag}</Link>
        </div>
    );
}
