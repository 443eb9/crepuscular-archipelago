import '@/app/global.css'
import FullscreenEmptyDiv from '@/components/common/fullscreen-empty-div';
import BlogArticles from '@/components/index/blog-articles';
import BlogTitle from '@/components/index/blog-title';
import GlobalNavBar from '@/components/nav/global-nav-bar';

export default function Page() {
    return (
        <main>
            <BlogTitle></BlogTitle>
            <FullscreenEmptyDiv></FullscreenEmptyDiv>
            <GlobalNavBar></GlobalNavBar>
            <BlogArticles></BlogArticles>
        </main>
    );
}
