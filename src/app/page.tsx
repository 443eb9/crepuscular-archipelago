import '@/app/global.css'
import BlogTitle from '@/components/index/blog-title';
import GlobalNavBar from '@/components/nav/global-nav-bar';

export default function Page() {
    return (
        <main className="flex">
            <GlobalNavBar></GlobalNavBar>
            <BlogTitle></BlogTitle>
        </main>
    );
}
