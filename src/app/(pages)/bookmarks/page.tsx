import ContentWrapper from "@/components/content-wrapper"
import NetworkErrorable from "@/components/network-errorable"
import { Metadata } from "next"
import Shelf from "./shelf"
import ShaderPreview from "./shader-preview"
import { wrappedGet } from "@/data/api"
import { frontendEndpoint } from "@/data/backend"
import { Bookmarks } from "@/data/model"

export const metadata: Metadata = {
    title: "Bookmarks - Crepuscular Archipelago",
}

export default async function Page() {
    const bookmarks = await wrappedGet<Bookmarks[]>(frontendEndpoint("/bookmarks.json"))

    return (
        <main>
            <ContentWrapper className="flex-col gap-5">
                <div className="flex gap-2 items-baseline">
                    <h1 className="text-4xl font-sh-serif font-bold">收藏夹</h1>
                    {
                        bookmarks.ok &&
                        <div className="font-bender text-large">
                            {bookmarks.data.map(data => data.content.length).reduce((acc, val) => acc + val)} items
                        </div>
                    }
                </div>
                <NetworkErrorable resp={bookmarks}>
                    {data => {
                        return <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-5">
                                {data.map((data, index) => <Shelf key={index} bookmarks={data}></Shelf>)}
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
                    }
                </NetworkErrorable>
            </ContentWrapper>
        </main>
    )
}
