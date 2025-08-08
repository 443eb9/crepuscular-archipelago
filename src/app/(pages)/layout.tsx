import ContentWrapper from "@/components/content-wrapper";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <ContentWrapper>
            {children}
        </ContentWrapper>
    )
}
