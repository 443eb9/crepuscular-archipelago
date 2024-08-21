import ContentWrapper from "@/components/common/content-wrapper";
import Footer from "@/components/common/footer";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full" lang="en">
            <GlobalNavBar></GlobalNavBar>
            <div className="h-20"></div>
            {children}
            <ContentWrapper className="my-5">
                <Footer></Footer>
            </ContentWrapper>
        </div>
    );
}
