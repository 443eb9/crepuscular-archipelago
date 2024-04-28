export default function OutlinedButton({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <button className={`flex justify-center items-center border-neutral-900 dark:border-neutral-50 hover:border-2 ${className}`}>
            {children}
        </button>
    );
}
