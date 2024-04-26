import NavButton from "./nav-button";

export default function NavButtons({ containerClassName, className }: { containerClassName?: string, className?: string }) {
    return (
        <div className={`flex ${containerClassName}`}>
            <NavButton title="首页" href={"/"} className={className}></NavButton>
            <NavButton title="文章" href={"/articles"} className={className}></NavButton>
            <NavButton title="关于" href={""} className={className}></NavButton>
        </div>
    );
}
