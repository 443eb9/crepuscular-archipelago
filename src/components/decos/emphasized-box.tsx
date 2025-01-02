import { HTMLAttributes } from "react"

export default function EmphasizedBox({ thickness, length, ...props }: { thickness: number, length: number } & HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`relative ${props.className}`}>
            {props.children}
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, left: -thickness, top: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, left: -thickness, top: -thickness }}></div>

            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, right: -thickness, top: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, right: -thickness, top: -thickness }}></div>

            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, right: -thickness, bottom: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, right: -thickness, bottom: -thickness }}></div>

            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: thickness, height: length + thickness, left: -thickness, bottom: -thickness }}></div>
            <div className="absolute bg-light-contrast dark:bg-dark-contrast" style={{ width: length + thickness, height: thickness, left: -thickness, bottom: -thickness }}></div>
        </div>
    )
}
