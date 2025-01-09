import GiscusSection from "@/components/giscus-section"
import Link from "next/link"

export default function ArticleFooter({ giscus, params }: { giscus: boolean, params: URLSearchParams }) {
    params.delete("id")

    return (
        <div>
            <Link href={`/updates?${params.toString()}`}>
                <div
                    className="font-argon font-bold text-4xl mb-4 w-full flex items-center 
                    border-2 border-light-contrast dark:border-dark-contrast"
                >
                    <div className="bg-dark-contrast dark:bg-light-contrast p-5">&lt $ cd .._</div>
                </div>
                {
                    giscus
                        ? <GiscusSection></GiscusSection>
                        : <div className="font-bender italic font-bold text-4xl">Giscus is disabled.</div>
                }
            </Link>
        </div>
    )
}
