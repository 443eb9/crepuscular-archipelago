import clsx from "clsx";
import { ReactNode } from "react";

export default function Toggle({ enabled, children, className }: { enabled: boolean, children: ReactNode, className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={clsx(
                `border-light-contrast dark:border-dark-contrast
                hover:bg-light-contrast hover:dark:bg-dark-contrast
                hover:text-dark-contrast hover:dark:text-light-contrast
                size-4 border-2 font-bold cursor-pointer`,
                { "bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast": enabled }
            )}>
            </div>
            {children}
        </div>
    );
}
