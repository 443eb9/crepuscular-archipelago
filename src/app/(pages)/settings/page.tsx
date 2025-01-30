import ContentWrapper from "@/components/content-wrapper";
import Encryption from "./encryption";

export default function Page() {
    return (
        <ContentWrapper className="flex flex-col">
            <Encryption />
        </ContentWrapper>
    )
}
