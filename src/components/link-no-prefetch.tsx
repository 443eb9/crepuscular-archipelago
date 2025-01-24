import Link, { LinkProps } from "next/link";
import React from "react";

export default function LinkNoPrefetch(props: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
    children?: React.ReactNode;
} & React.RefAttributes<HTMLAnchorElement>) {
    return <LinkNoPrefetch {...props} prefetch={false} />
}
