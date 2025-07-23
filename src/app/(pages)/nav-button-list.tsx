import LinkNoPrefetch from "@/components/link-no-prefetch"
import OutlinedButton from "@/components/outlined-button"
import Text from "@/components/text"
import { LinkProps } from "next/link"

export default function NavButtonList({ className }: { className?: string }) {
    function NavButton({ title, ...props }: { title: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>) {
        return (
            <LinkNoPrefetch {...props} className={`font-sh-serif font-bold ${className}`}>
                <OutlinedButton className="w-full h-full">
                    <Text elem="h2">{title}</Text>
                </OutlinedButton>
            </LinkNoPrefetch>
        )
    }

    return (
        <>
            <NavButton title="首页" href={"/"} />
            <NavButton title="地图" href={"/map"} />
            <NavButton title="动态" href={"/updates"} />
            <NavButton title="关于" href={"/about"} />
            <NavButton title="收藏" href={"/bookmarks"} />
            <NavButton title="设置" href={"/settings"} />
            <NavButton title="开往" href={"https://www.travellings.cn/go.html"} target="_blank" />
        </>
    )
}
