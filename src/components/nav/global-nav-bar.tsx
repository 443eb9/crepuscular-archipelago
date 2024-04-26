import '@/app/global.css'
import ThemeSwither from './theme-swither';
import NavButton from './nav-button';

export default function GlobalNavBar() {
    return (
        <div className="fixed top-0 flex w-full h-14 pl-5 md:pl-20 md:pr-20 justify-between items-center shadow-md border-neutral-900 dark:border-neutral-50 border-b-2 backdrop-blur-md z-10">
            <div className="hidden md:flex flex-shrink-0 gap-2">
                <h1 className="font-bender font-bold text-2xl">Crepuscular Archipelago</h1>
                <ThemeSwither></ThemeSwither>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                <ThemeSwither className="block md:hidden"></ThemeSwither>
                <NavButton title="首页" href={"/"}></NavButton>
                <NavButton title="文章" href={"/articles"}></NavButton>
                <NavButton title="关于" href={""}></NavButton>
            </div>
        </div>
    );
}
