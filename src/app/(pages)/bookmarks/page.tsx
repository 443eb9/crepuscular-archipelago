import ShaderPreview from "@/components/bookmarks/shader-preview";
import Shelf from "@/components/bookmarks/shelf";
import ContentWrapper from "@/components/common/content-wrapper";
import NetworkErrorFallback from "@/components/common/network-error-fallback";
import { Bookmarks } from "@/data/model";
import { ErrorResponse, get } from "@/data/requests";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bookmarks - Crepuscular Archipelago",
}

export default async function Page() {
    const bookmarks = await get("https://raw.githubusercontent.com/443eb9/aetheric-cargo/main/partitions/bookmarks.json");
    const data: undefined | Bookmarks[] = bookmarks instanceof ErrorResponse ? undefined : bookmarks.data;

    return (
        <main>
            <ContentWrapper className="flex-col gap-5">
                <div className="flex gap-2 items-baseline">
                    <h1 className="text-4xl font-sh-serif font-bold">收藏夹</h1>
                    {
                        data != undefined &&
                        <div className="font-bender text-large">
                            {data.map((data, _) => data.content.length).reduce((acc, val) => acc + val)} items
                        </div>
                    }
                </div>
                {
                    data == undefined
                        ? <NetworkErrorFallback error={bookmarks as ErrorResponse}></NetworkErrorFallback>
                        : <div className="">
                            <div className="flex flex-col gap-5">
                                {
                                    data.map((data, index) => <Shelf key={index} bookmarks={data}></Shelf>)
                                }
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-baseline">
                                    <h1 className="text-4xl font-sh-serif font-bold">Shader预览</h1>
                                    <div className="text-large text-light-dark-neutral italic font-sh-sans">点击序号可跳转</div>
                                </div>
                                <div className="hidden md:block">
                                    <ShaderPreview bookmarks={data[0].content}></ShaderPreview>
                                </div>
                                <div className="block md:hidden font-sh-sans italic text-medium">
                                    Shader预览仅电脑端可查看:(
                                </div>
                            </div>
                        </div>
                }
            </ContentWrapper>
        </main>
    );
}
