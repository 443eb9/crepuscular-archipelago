import ContentWrapper from "@/components/content-wrapper";
import Encryption from "./encryption";
import ThemeSwither from "./theme-switcher";

export default function Page() {
    return (
        <ContentWrapper className="flex flex-col gap-4">
            <ThemeSwither />
            <Encryption />
        </ContentWrapper>
    )
}
