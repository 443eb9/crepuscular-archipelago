import BlogArticles from "@/components/updates/blog-articles";
import BlogInfo from "@/components/updates/blog-info";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";
import ContentWrapper from "@/components/common/content-wrapper";

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-20"></div>
            <div className="flex flex-col gap-10 md:pl-0 md:pr-0">
                <aside className="block md:hidden pl-5 pr-5">
                    <BlogInfo></BlogInfo>
                </aside>
                <div className="flex justify-center">
                    <ContentWrapper className="gap-10">
                        <BlogArticles></BlogArticles>
                        <aside className="hidden md:block w-72">
                            <BlogInfo></BlogInfo>
                        </aside>
                    </ContentWrapper>
                </div>
            </div>
        </main>
    );
}
