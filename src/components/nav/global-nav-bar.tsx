import '@/app/global.css'
import ThemeSwither from './theme-swither';
import NavButton from './nav-button';

export default function GlobalNavBar() {
    return (
        <div className="flex flex-grow h-14 pl-20 pr-20 justify-between items-center shadow-md border-neutral-900 dark:border-neutral-50 border-b-2">
            <div className="flex flex-shrink-0 gap-2">
                <h1 className="font-bender font-bold text-2xl">Crepuscular Archipelago</h1>
                <ThemeSwither></ThemeSwither>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                <NavButton title="首页" href={""}></NavButton>
                <NavButton title="关于" href={""}></NavButton>
            </div>
        </div>
    );
}
