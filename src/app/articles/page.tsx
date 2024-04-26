import BlogArticles from "@/components/articles/blog-articles";
import BlogInfo from "@/components/articles/blog-info";
import GlobalNavBar from "@/components/nav/global-nav-bar";

export default function Page() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-10"></div>
            <div className="flex flex-col gap-10 p-10">
                <aside className="block md:hidden">
                    <BlogInfo></BlogInfo>
                </aside>
                <div className="flex justify-center">
                    <div className="flex gap-10 max-w-[1080px]">
                        <div className="flex">
                            <BlogArticles></BlogArticles>
                        </div>
                        <aside className="hidden md:block w-72">
                            <BlogInfo></BlogInfo>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}
