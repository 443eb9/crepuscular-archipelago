import Link from "next/link";
import OutlinedBox from "../common/outlined-box";
import GiscusSection from "./giscus";

export default function ArticleFooter({ giscus }: { giscus: boolean }) {
    return (
        <div>
            <Link href={"/updates"}>
                <OutlinedBox className="font-argon font-bold text-4xl p-5 mb-4">
                    &lt; $ cd .._
                </OutlinedBox>
                {
                    giscus
                        ? <GiscusSection></GiscusSection>
                        : <div className="font-bender italic font-bold text-4xl">Giscus is disabled.</div>
                }
            </Link>
        </div>
    );
}
