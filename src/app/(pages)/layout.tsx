import ContentWrapper from "@/components/content-wrapper"
import GlobalNavBar from "./global-nav-bar"
import Footer from "@/components/footer"
import EmphasizedBox from "@/components/decos/emphasized-box"
import ThemeSwitcher from "@/components/theme-switcher"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full" lang="en">
            <GlobalNavBar />
            <div className="h-20"></div>
            {children}
            <ContentWrapper className="my-5">
                <Footer />
            </ContentWrapper>
            <EmphasizedBox
                thickness={3}
                length={8}
                className="block md:hidden bottom-4 left-4 pt-1 px-1"
                style={{ position: "fixed" }}
            >
                <ThemeSwitcher />
            </EmphasizedBox>
        </div>
    )
}
