export default function SpTag({ content }: { content?: string }) {
    return (
        <div className="w-10 h-full flex items-center justify-center bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900">
            <div className="text-center font-sh-serif font-bold text-xs">{content}</div>
        </div>
    );
}
