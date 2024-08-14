import { MouseEventHandler } from "react";

export default function OutlinedButton(
    {
        name, type, onClick, children, className
    }: {
        name?: string, type?: "submit" | "reset" | "button", onClick?: MouseEventHandler<HTMLButtonElement>, children?: React.ReactNode, className?: string
    }
) {
    return (
        <button
            name={name}
            type={type}
            onClick={onClick}
            className={
                `flex justify-center items-center
                border-light-contrast dark:border-dark-contrast 
                hover:dark:bg-dark-contrast hover:text-dark-contrast hover:border-2 border-2
                hover:bg-light-contrast hover:dark:text-light-contrast ${className}`
            }
        >
            {children}
        </button>
    );
}
