import ContentWrapper from "@/components/content-wrapper";
import Footer from "@/components/footer";
import NavBar from "@/components/nav-bar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col">
            <NavBar />
            <ContentWrapper className="pt-14">
                {children}
            </ContentWrapper>
            <Footer />
        </div>
    )
}
