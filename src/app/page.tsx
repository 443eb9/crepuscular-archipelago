import '@/app/global.css'
import BlogTitleCn from '@/components/index/blog-title-cn';
import BlogTitleEn from '@/components/index/blog-title-en';
import IslandsCanvas from '@/components/index/islands-canvas';
import NavButtons from '@/components/nav/nav-buttons';

export default function Page() {
    return (
        <main>
            <div className="absolute">
                <IslandsCanvas></IslandsCanvas>
            </div>
            <div className="absolute top-[10%] md:top-1/4 left-[10%]">
                <BlogTitleEn></BlogTitleEn>
            </div>
            <div className="absolute bottom-[15%] md:top-1/4 right-[10%]">
                <BlogTitleCn></BlogTitleCn>
            </div>
            <div className="absolute md:bottom-1/4 md:right-[10%]">
                <NavButtons className="w-40 h-20 text-3xl" containerClassName="gap-10"></NavButtons>
            </div>
        </main>
    );
}
