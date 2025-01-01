import NavButton from "./nav-button"

export default function NavButtons({ containerClassName, className }: { containerClassName?: string, className?: string }) {
    return (
        <div className={`flex ${containerClassName}`}>
            <NavButton title="首页" href={"/"} className={className}></NavButton>
            <NavButton title="动态" href={"/updates"} className={className}></NavButton>
            <NavButton title="关于" href={"/about"} className={className}></NavButton>
            <NavButton title="收藏" href={"/bookmarks"} className={className}></NavButton>
        </div>
    )
}
