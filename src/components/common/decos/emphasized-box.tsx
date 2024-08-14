import { CSSProperties, ReactNode } from "react";

export default function EmphasizedBox({ className, thickness, length, children, style }: { className?: string, thickness: number, length: number, children?: ReactNode, style?: CSSProperties }) {
    return (
        <div className={`relative ${className}`} style={style}>
            {children}
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, left: -thickness, top: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, left: -thickness, top: -thickness }}></div>

            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, right: -thickness, top: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, right: -thickness, top: -thickness }}></div>
            
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, right: -thickness, bottom: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, right: -thickness, bottom: -thickness }}></div>
            
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, left: -thickness, bottom: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, left: -thickness, bottom: -thickness }}></div>
        </div>
    );
}
