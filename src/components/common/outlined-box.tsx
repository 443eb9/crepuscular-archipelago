import { CSSProperties } from "react";

export default function OutlinedBox({ className, children, style }: { className?: string, children?: React.ReactNode, style?: CSSProperties }) {
    return (
        <div className={`border-2 border-neutral-900 dark:border-neutral-50 ${className}`} style={style}>
            {children}
        </div>
    );
}
