export default function OutlinedButton({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <button className={`flex justify-center items-center border-neutral-900 dark:border-neutral-50 hover:dark:bg-neutral-50 hover:text-neutral-50 hover:border-2 border-2 hover:bg-neutral-900 hover:dark:text-neutral-900 ${className}`}
        >
            {children}
        </button>
    );
}
