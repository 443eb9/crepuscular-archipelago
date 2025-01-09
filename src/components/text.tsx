import React, { HTMLAttributes, ReactNode } from "react";

export type TextElem = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span"

export default function Text({
    children, elem, noFont, ...props
}: Readonly<
    { children?: ReactNode, elem?: TextElem, noFont?: boolean } & HTMLAttributes<HTMLElement>
>) {
    return React.createElement(
        elem ?? "div",
        {
            ...props,
            className: `
                ${!noFont ? elem && elem[0] == "h" ? "font-sh-serif font-bold" : "font-sh-sans" : ""}
                ${props.className}
            `
        },
        children
    )
}
