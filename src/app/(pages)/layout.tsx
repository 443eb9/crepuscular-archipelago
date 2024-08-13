import ContentWrapper from "@/components/common/content-wrapper";
import Footer from "@/components/common/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="" lang="en">
            {children}
            <ContentWrapper className="my-5">
                <Footer></Footer>
            </ContentWrapper>
        </div>
    );
}
