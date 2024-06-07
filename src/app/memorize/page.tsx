import '@/app/global.css'
import ContentWrapper from "@/components/common/content-wrapper";
import ThemeSwither from '@/components/common/nav/theme-switcher';
import OutlinedBox from "@/components/common/outlined-box";
import MemorizeForm from "@/components/memorize/memorize-form";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Memorize - Crepuscular Archipelago",
}

export default function Page() {
    return (
        <main>
            <ContentWrapper className="py-5 md:py-16">
                <OutlinedBox className="flex flex-col gap-4 w-full p-5">
                    <div className="font-sh-sans italic">
                        嗨，首先非常感谢你愿意花时间来填写这个表格！你可以提交任意次数，但你的每一次提交都会被记录。由于提交时会携带你的ip数据，因此最好在自己的设备上提交而不是用学校的电脑 :p
                        <br></br>
                        出了点事故，红豆泥私密马赛，再补偿你一个月亮/太阳吧:p 20240525-16:24:39
                        <ThemeSwither></ThemeSwither>
                        <br></br>
                        好像大家都误会了，其实留言什么的不一定要给我留的，你可以给班里任意一个人留<del>，甚至是那只鸟</del>。我希望这个同学录可以适用每一个人:p <del>要不然我就不会开放下载了（逃</del> 20240526-09:47:02
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="font-sh-serif font-bold text-2xl">切换主题</div>
                        <ThemeSwither></ThemeSwither>
                    </div>
                    <MemorizeForm></MemorizeForm>
                </OutlinedBox>
            </ContentWrapper>
        </main>
    );
}
