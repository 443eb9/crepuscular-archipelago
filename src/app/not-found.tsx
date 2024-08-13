import ContentWrapper from "@/components/common/content-wrapper";
import GlobalNavBar from "@/components/common/nav/global-nav-bar";

export default function NotFound() {
    return (
        <main>
            <GlobalNavBar></GlobalNavBar>
            <div className="flex-1 h-20"></div>
            <ContentWrapper className="flex flex-col">
                <div className="font-bender font-bold text-5xl">Fatal: Unknown Coordinate</div>
                <div className="font-argon">
                    <div className="">Terminal Output:</div>
                    <div className="">&gt; [INFO][{new Date().toISOString()}][Teleporter] Start teleporting to island {Math.floor(Math.random() * 10000000)}.</div>
                    <div className="">&gt; [FATAL][{new Date().toISOString()}][Teleporter] Undefined island coordinate.</div>
                    <div className="">&gt; [FATAL][{new Date().toISOString()}][Renderer] Failed to render the scene.</div>
                </div>
            </ContentWrapper>
        </main>
    );
}
