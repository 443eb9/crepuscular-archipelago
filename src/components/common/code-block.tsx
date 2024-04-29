import { TbBrandCSharp, TbBrandCpp, TbBrandRust } from "react-icons/tb";
import OutlinedBox from "./outlined-box";

export default function CodeBlock({ lang, children, className }: { lang: string, children?: React.ReactNode, className?: string }) {
    const icon = getLanguageIcon(lang);
    return (
        <OutlinedBox className={`flex flex-col gap-2 p-5 ${className}`}>
            {icon}
            <div className="border-2 border-neutral-900 dark:border-neutral-50"></div>
            <div className="cursor-text bg-neutral-900 dark:bg-transparent p-3">
                {children}
            </div>
        </OutlinedBox>
    );
}

function getLanguageIcon(lang: string) {
    switch (lang) {
        case "rust": return <LanguageIcon lang="Rust" icon={<TbBrandRust />}></LanguageIcon>
        case "csharp": return <LanguageIcon lang="C#" icon={<TbBrandCSharp />}></LanguageIcon>
        case "cpp": return <LanguageIcon lang="C++" icon={<TbBrandCpp />}></LanguageIcon>
    }
}

function LanguageIcon({ lang, icon }: { lang: string, icon: React.ReactNode }) {
    return (
        <div className="flex gap-2 font-bender items-center text-2xl">
            <div>{icon}</div>
            <div className="font-bold">{lang}</div>
        </div>
    );
}
