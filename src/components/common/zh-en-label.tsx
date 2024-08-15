export default function ZhEnLabel({ zh, en, className, zhClassName, enClassName }: { zh: string, en: string, className?: string, zhClassName?: string, enClassName?: string }) {
    return (
        <div className={`flex flex-row gap-1 ${className}`}>
            <div className={`font-sh-sans ${zhClassName}`}>{zh}</div>
            <div className={`font-bender ${enClassName}`}>{en}</div>
        </div>
    );
}
