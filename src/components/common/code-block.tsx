import OutlinedBox from "./outlined-box";

export default function CodeBlock({ lang, children, className }: { lang: string, children?: React.ReactNode, className?: string }) {
    return (
        <OutlinedBox className={`p-5 ${className}`}>
            <h1 className="font-bender text-lg">{lang}</h1>
            <hr />
            <div className="cursor-text">
                {children}
            </div>
        </OutlinedBox>
    );
}
