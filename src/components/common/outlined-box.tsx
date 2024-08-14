import { CSSProperties } from "react";

export default function OutlinedBox({ className, children, style }: { className?: string, children?: React.ReactNode, style?: CSSProperties }) {
    return (
        <div className={`border-2 border-light-contrast dark:border-dark-contrast ${className}`} style={style}>
            {children}
        </div>
    );
}
