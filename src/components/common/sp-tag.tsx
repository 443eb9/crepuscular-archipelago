export default function SpTag({ content }: { content?: string }) {
    return (
        <div className="w-10 h-7 flex items-center justify-center bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast">
            <div className="text-center font-sh-serif font-bold text-xs">{content}</div>
        </div>
    )
}
