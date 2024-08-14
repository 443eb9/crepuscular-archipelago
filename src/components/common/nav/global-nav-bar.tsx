import '@/app/global.css'
import ThemeSwither from './theme-switcher';
import NavButtons from './nav-buttons';
import Link from 'next/link';

export default function GlobalNavBar() {
    return (
        <div className="fixed top-0 flex w-full h-14 pl-5 md:pl-20 md:pr-20 justify-between items-center shadow-md border-light-contrast dark:border-dark-contrast border-b-2 backdrop-blur-md z-10">
            <div className="hidden md:flex flex-shrink-0 gap-2">
                <Link href={"/"} className="font-bender font-bold text-2xl hover:border-b-2 border-light-contrast dark:border-dark-contrast">Crepuscular Archipelago</Link >
                <ThemeSwither></ThemeSwither>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                <ThemeSwither className="block md:hidden"></ThemeSwither>
                <NavButtons className="w-20 h-10" containerClassName="gap-2"></NavButtons>
            </div>
        </div>
    );
}
