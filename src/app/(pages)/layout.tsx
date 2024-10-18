import ContentWrapper from "@/components/common/content-wrapper";
import EmphasizedBox from "@/components/common/decos/emphasized-box";
import Footer from "@/components/common/footer";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ThemeSwither from "@/components/common/nav/theme-switcher";

export const revalidate = 600;

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full" lang="en">
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            {children}
            <ContentWrapper className="my-5">
                <Footer></Footer>
            </ContentWrapper>
            <EmphasizedBox
                thickness={3}
                length={8}
                className="block md:hidden bottom-4 left-4 pt-1 px-1"
                style={{ position: "fixed" }}
            >
                <ThemeSwither></ThemeSwither>
            </EmphasizedBox>
        </div>
    );
}
