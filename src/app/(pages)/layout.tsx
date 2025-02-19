import ContentWrapper from "@/components/content-wrapper"
import GlobalNavBar from "./global-nav-bar"
import Footer from "@/components/footer"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full" lang="en">
            <GlobalNavBar className="fixed z-10" />
            <GlobalNavBar className="relative opacity-0 mb-4" />
            {children}
            <ContentWrapper className="my-5">
                <Footer />
            </ContentWrapper>
        </div>
    )
}
