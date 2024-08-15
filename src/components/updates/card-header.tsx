import { IslandMeta, IslandType } from "@/data/model";
import OutlinedBox from "../common/outlined-box";
import { OSS } from "@/data/backend";
import { RiMedal2Line } from "react-icons/ri";

export default function CardHeader({ island: card }: { island: IslandMeta }) {
    switch (card.ty) {
        case IslandType.Achievement | IslandType.Note:
            return <AchievementCardHeader></AchievementCardHeader>;
        case IslandType.Article:
            return <ArticleCardHeader card={card}></ArticleCardHeader>;
        default: <div></div>
    }
}

function ArticleCardHeader({ card }: { card: IslandMeta }) {
    return (
        <div className="mb-2">
            {
                card.banner &&
                <OutlinedBox
                    className="w-full bg-cover"
                    style={{
                        aspectRatio: "10 / 3",
                        backgroundImage: `url(${OSS}/${card.id}/BANNER.png)`
                    }}
                >
                </OutlinedBox>
            }
        </div>
    );
}

function AchievementCardHeader() {
    return (
        <div className="flex items-center justify-center">
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
    );
}