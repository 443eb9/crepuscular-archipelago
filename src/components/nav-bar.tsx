import Link from "next/link";
import ContentWrapper from "./content-wrapper";
import AsciiText from "./text/ascii-text";
import ThemeSwitcher from "./theme-switcher";
import NavBarButtons from "./nav-bar-buttons";

export default function NavBar() {
    return (
        <>
            <div className="fixed w-[100vw] h-12 flex items-center border-b-2 border-dark-0 dark:border-light-0 backdrop-blur-md z-10">
                <ContentWrapper className="justify-between items-center">
                    <div className="">
                        <AsciiText className="font-bold text-2xl hover:text-accent-0">
                            <Link href="/">
                                Crepuscular Archipelago
                            </Link>
                        </AsciiText>
                    </div>
                    <div className="relative">
                        <ThemeSwitcher className="md:absolute w-10 aspect-square md:-right-12" />
                        <div className="hidden md:flex gap-2">
                            <NavBarButtons />
                        </div>
                    </div>
                </ContentWrapper>
            </div>
            <div className="fixed w-[100vw] z-10 md:hidden flex gap-2 bottom-0 border-b-2 border-dark-0 dark:border-light-0 py-1 backdrop-blur-md -scale-y-100">
                <NavBarButtons flipped />
            </div>
        </>
    )
}
