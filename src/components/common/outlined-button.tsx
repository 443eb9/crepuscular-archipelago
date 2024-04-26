export default function OutlinedButton({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <button className={`flex justify-center items-center w-full h-full border-neutral-900 dark:border-neutral-50 hover:border-2 ${className}`}>
            {children}
        </button>
    );
}
