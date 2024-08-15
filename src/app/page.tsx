import '@/app/global.css'
import BlogTitleCn from '@/components/index/blog-title-cn';
import BlogTitleEn from '@/components/index/blog-title-en';
import NavButtons from '@/components/common/nav/nav-buttons';
import { Metadata } from 'next';
import axios, { AxiosError } from 'axios';

export const metadata: Metadata = {
    title: "443eb9#C - Crepuscular Archipelago",
    description: "443eb9#C's blog - Islands that owned by 443eb9#C."
}

export default async function Page() {
    return (
        <main className="">
            <div className="absolute top-[10%] md:top-1/4 left-[10%]">
                <BlogTitleEn></BlogTitleEn>
                <div className="font-bender">Background under construction...</div>
            </div>
            <div className="absolute bottom-[15%] md:top-1/4 right-[10%] text-right">
                <BlogTitleCn></BlogTitleCn>
            </div>
            <div className="absolute left-[10%] bottom-1/4">
                <NavButtons
                    className="w-20 h-10 md:w-40 md:h-20 text-lg md:text-3xl"
                    containerClassName="gap-4 md:gap-10 flex-col md:flex-row"
                ></NavButtons>
            </div>
        </main>
    );
}
