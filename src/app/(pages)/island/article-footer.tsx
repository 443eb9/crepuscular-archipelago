import AnimHoverInvertBox from "@/components/anim/anim-hover-invert"
import GiscusSection from "@/components/giscus-section"
import LinkNoPrefetch from "@/components/link-no-prefetch"
import OutlinedBox from "@/components/outlined-box"
import Text from "@/components/text"
import { QueryParams, queryParamsToSearchParams } from "@/data/search-param-util"

export default function ArticleFooter({ giscus, params }: { giscus: boolean, params: QueryParams }) {
    return (
        <>
            <LinkNoPrefetch href={`/updates?${queryParamsToSearchParams(params)}`}>
                <OutlinedBox>
                    <AnimHoverInvertBox>
                        <Text className="p-5 font-neon font-bold text-4xl " noFont>&lt; $ cd .._</Text>
                    </AnimHoverInvertBox>
                </OutlinedBox>
            </LinkNoPrefetch>
            {
                giscus
                    ? <GiscusSection></GiscusSection>
                    : <div className="font-bender italic font-bold text-4xl">Giscus is disabled.</div>
            }
        </>
    )
}
