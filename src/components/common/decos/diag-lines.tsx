export default function DiagLines({ className, scale }: { className?: string, scale: string }) {
    return (
        <div className={`bg-dark-diag-lines bg-repeat dark:invert ${className}`} style={{ backgroundSize: scale }}></div>
    );
}
