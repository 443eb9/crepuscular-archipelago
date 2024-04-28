import '@/app/global.css'
import BlogTitleCn from '@/components/index/blog-title-cn';
import BlogTitleEn from '@/components/index/blog-title-en';
import NavButtons from '@/components/nav/nav-buttons';

export default function Page() {
    return (
        <main>
            <div className="absolute top-[10%] md:top-1/4 left-[10%]">
                <BlogTitleEn></BlogTitleEn>
                <div className="font-bender">Background under construction...</div>
            </div>
            <div className="absolute bottom-[15%] md:top-1/4 right-[10%]">
                <BlogTitleCn></BlogTitleCn>
            </div>
            <div className="absolute left-[10%] bottom-1/4">
                <NavButtons className="w-20 h-10 md:w-40 md:h-20 text-lg md:text-3xl" containerClassName="gap-4 md:gap-10 flex-col md:flex-row"></NavButtons>
            </div>
        </main>
    );
}
