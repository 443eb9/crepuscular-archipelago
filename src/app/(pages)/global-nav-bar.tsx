import NavButtons from "./nav-buttons"
import DropdownNav from "./dropdown-nav"
import Text from "@/components/text"
import LinkNoPrefetch from "@/components/link-no-prefetch"
import { HTMLAttributes } from "react"

export default function GlobalNavBar(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`top-0 flex w-full py-2 px-5 md:px-20 justify-between items-center shadow-md border-light-contrast dark:border-dark-contrast border-b-2 backdrop-blur-md z-10 ${props.className}`}
        >
            <div className="flex flex-grow md:flex-grow-0 gap-2 justify-between md:justify-start">
                <LinkNoPrefetch href={"/"} className="hover:border-b-2 border-light-contrast dark:border-dark-contrast">
                    <Text elem="h1" className="font-bender font-bold text-2xl" noFont>Crepuscular Archipelago</Text>
                </LinkNoPrefetch>
                <DropdownNav className="block md:hidden" />
            </div>
            <div className="hidden md:flex gap-2 flex-wrap justify-end">
                <NavButtons className="w-20 h-10" />
            </div>
        </div>
    )
}
