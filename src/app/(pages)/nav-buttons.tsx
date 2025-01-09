import OutlinedButton from "@/components/outlined-button"
import Link, { LinkProps } from "next/link"

export default function NavButtons({ containerClassName, className }: { containerClassName?: string, className?: string }) {
    function NavButton({ title, ...props }: { title: string } & LinkProps) {
        return (
            <Link {...props} className={`font-sh-serif font-bold ${className}`}>
                <OutlinedButton className="w-full h-full">
                    {title}
                </OutlinedButton>
            </Link>
        )
    }

    return (
        <div className={`flex ${containerClassName}`}>
            <NavButton title="首页" href={"/"}></NavButton>
            <NavButton title="动态" href={"/updates"}></NavButton>
            <NavButton title="关于" href={"/about"}></NavButton>
            <NavButton title="收藏" href={"/bookmarks"}></NavButton>
        </div>
    )
}
