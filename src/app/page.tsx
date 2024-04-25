import '@/app/global.css'
import BlogArticles from '@/components/index/blog-articles';
import BlogTitle from '@/components/index/blog-title';
import GlobalNavBar from '@/components/nav/global-nav-bar';

export default function Page() {
    return (
        <main>
            <BlogTitle></BlogTitle>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex justify-center">
                <BlogArticles></BlogArticles>
            </div>
        </main>
    );
}
