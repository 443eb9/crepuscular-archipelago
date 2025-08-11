import AsciiText from "@/components/text/ascii-text";
import TitleText from "@/components/text/title-text";

export default function Page() {
    return (
        <div className="w-[100vw] h-[100vh] flex justify-center items-center">
            <div className="flex flex-col">
                <TitleText className="text-2xl">正在重构...</TitleText>
                <AsciiText>Refactoring...</AsciiText>
            </div>
        </div>
    )
}
