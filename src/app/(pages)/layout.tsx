import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="max-w-[1080px]">
            {children}
        </div>
    )
}
