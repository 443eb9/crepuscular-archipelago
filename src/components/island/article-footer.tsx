import Link from "next/link";
import GiscusSection from "./giscus";
import OutlinedButton from "../common/interact/outlined-button";

export default function ArticleFooter({ giscus, params }: { giscus: boolean, params: URLSearchParams }) {
    params.delete("id");

    return (
        <div>
            <Link href={`/updates?${params.toString()}`}>
                <OutlinedButton className="font-argon font-bold text-4xl p-5 mb-4 w-full">
                    <div className="w-full text-left">&lt; $ cd .._</div>
                </OutlinedButton>
                {
                    giscus
                        ? <GiscusSection></GiscusSection>
                        : <div className="font-bender italic font-bold text-4xl">Giscus is disabled.</div>
                }
            </Link>
        </div>
    );
}
