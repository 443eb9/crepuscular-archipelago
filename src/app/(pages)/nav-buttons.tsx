import LinkNoPrefetch from "@/components/link-no-prefetch"
import OutlinedButton from "@/components/outlined-button"
import Text from "@/components/text"
import Link, { LinkProps } from "next/link"

export default function NavButtons({ containerClassName, className }: { containerClassName?: string, className?: string }) {
    function NavButton({ title, ...props }: { title: string } & LinkProps) {
        return (
            <LinkNoPrefetch {...props} className={`font-sh-serif font-bold ${className}`}>
                <OutlinedButton className="w-full h-full">
                    <Text elem="h2">{title}</Text>
                </OutlinedButton>
            </LinkNoPrefetch>
        )
    }

    return (
        <div className={`flex ${containerClassName}`}>
            <NavButton title="首页" href={"/"}></NavButton>
            <NavButton title="地图" href={"/map"}></NavButton>
            <NavButton title="动态" href={"/updates"}></NavButton>
            <NavButton title="关于" href={"/about"}></NavButton>
            <NavButton title="收藏" href={"/bookmarks"}></NavButton>
        </div>
    )
}
