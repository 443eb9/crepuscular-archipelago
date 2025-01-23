import { HTMLAttributes, KeyboardEventHandler } from "react";

export default function Input({
    onEnterDown, ...props
}: HTMLAttributes<HTMLInputElement> & {
    onEnterDown?: KeyboardEventHandler<HTMLInputElement>
}) {
    return (
        <input
            {...props}
            className={`
                outline-none p-1 border-b-2 bg-transparent font-sh-sans
                border-light-dark-neutral focus:border-light-contrast dark:focus:border-dark-contrast
                ${props.className}
            `}
            onKeyDown={ev => {
                props.onKeyDown?.(ev)

                if (onEnterDown != undefined && ev.key == "Enter") {
                    onEnterDown(ev)
                    ev.currentTarget.blur()
                }

                if (ev.key == "Escape") {
                    ev.currentTarget.blur()
                }
            }}
        />
    )
}
