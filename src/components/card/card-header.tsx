import { IslandMeta } from "@/data/model"
import { OSS } from "@/data/endpoints"
import { RiMedal2Line } from "react-icons/ri"
import OutlinedBox from "@/components/outlined-box"
import Image from "../image"

export default function CardHeader({ island }: { island: IslandMeta }) {
    let header
    switch (island.ty) {
        case "achievement":
            header = <AchievementCardHeader />
            break
        case "article":
            header = <ArticleCardHeader island={island} />
            break
    }

    return (
        <div>
            <h2 className="absolute font-bender font-bold leading-none pl-2 py-[2px] text-[10px] w-20 -top-1 left-3
                text-dark-contrast dark:text-light-contrast bg-light-contrast dark:bg-dark-contrast"
            >{`# ${island.id}`}</h2>
            {header}
        </div>
    )
}

function ArticleCardHeader({ island }: { island: IslandMeta }) {
    return (
        <div>
            {
                island.banner &&
                <div className="mb-2">
                    <OutlinedBox
                        className="relative w-full bg-cover"
                        style={{
                            aspectRatio: "10 / 3",
                        }}
                    >
                        <Image src={`${OSS}/${island.id}/BANNER.png`} alt="Banner" scale={1} />
                    </OutlinedBox>
                </div>
            }
        </div>
    )
}

function AchievementCardHeader() {
    return (
        <div className="flex items-center justify-center mb-1">
            <div className="hidden md:flex">
                <div className="bg-light-contrast dark:bg-dark-contrast w-2 h-3 mr-2"></div>
                <div className="bg-light-contrast dark:bg-dark-contrast w-6 h-3 mr-3"></div>
                <div className="bg-light-contrast dark:bg-dark-contrast w-12 h-3 mr-4"></div>
            </div>
            <RiMedal2Line className="text-4xl"></RiMedal2Line>
            <h1 className="font-bender font-bold text-lg">Achievement Unlocked!</h1>
            <div className="hidden md:flex">
                <div className="bg-light-contrast dark:bg-dark-contrast w-12 h-3 ml-4"></div>
                <div className="bg-light-contrast dark:bg-dark-contrast w-6 h-3 ml-3"></div>
                <div className="bg-light-contrast dark:bg-dark-contrast w-2 h-3 ml-2"></div>
            </div>
        </div>
    )
}