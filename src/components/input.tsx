import { HTMLAttributes, KeyboardEventHandler, Ref } from "react";

export default function Input({
    onEnterDown, ref, ...props
}: HTMLAttributes<HTMLInputElement> & {
    onEnterDown?: KeyboardEventHandler<HTMLInputElement>
    ref?: Ref<HTMLInputElement>
}) {
    return (
        <input
            {...props}
            ref={ref}
            className={`
                outline-none p-1 border-b-2 bg-transparent font-sh-sans
                border-light-dark-neutral focus:border-dark-0 dark:focus:border-light-0
                text-dark-0 dark:text-light-0
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
