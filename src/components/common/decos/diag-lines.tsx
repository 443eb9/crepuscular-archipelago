export default function DiagLines({ className, scale }: { className?: string, scale: number }) {
    return (
        <div className={`bg-diag-lines bg-repeat dark:invert ${className}`} style={{ backgroundSize: scale }}></div>
    );
}
