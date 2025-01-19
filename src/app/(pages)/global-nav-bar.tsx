import Link from "next/link"
import NavButtons from "./nav-buttons"
import DropdownNav from "./dropdown-nav"
import ThemeSwither from "@/components/theme-switcher"
import Text from "@/components/text"

export default function GlobalNavBar() {
    return (
        <div className="fixed top-0 flex w-full h-14 p-5 md:pl-20 md:pr-20 justify-between items-center shadow-md border-light-contrast dark:border-dark-contrast border-b-2 backdrop-blur-md z-10">
            <div className="flex flex-grow md:flex-grow-0 gap-2 justify-between">
                <Link href={"/"} className="hover:border-b-2 border-light-contrast dark:border-dark-contrast">
                    <Text elem="h1" className="font-bender font-bold text-2xl" noFont>Crepuscular Archipelago</Text>
                </Link >
                <ThemeSwither className="hidden md:block" />
                <DropdownNav className="block md:hidden" />
            </div>
            <div className="hidden md:flex flex-shrink-0 gap-2">
                <NavButtons className="w-20 h-10" containerClassName="gap-2" />
            </div>
        </div>
    )
}
