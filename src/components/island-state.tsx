import { IslandStateType } from "@/data/model";
import { FaClock } from "react-icons/fa6";
import Text from "./text";
import { TbClockQuestion } from "react-icons/tb";
import { IoCubeOutline } from "react-icons/io5";

export default function IslandState({ date, state }: { date: string | null, state: IslandStateType }) {
    switch (state) {
        case "finished":
            return (
                <div className="flex items-center gap-1">
                    <FaClock />
                    <Text className="font-bender" suppressHydrationWarning>
                        {date && new Date(date).toLocaleDateString()}
                    </Text>
                </div>
            )
        case "workInProgress":
            return (
                <div className="flex items-center gap-1">
                    <TbClockQuestion className="text-lg" />
                    <div className="font-bender">Future</div>
                </div>
            )
        case "longTermProject":
            return (
                <div className="flex items-center gap-1">
                    <IoCubeOutline className="text-lg" />
                    <div className="font-bender">Long Term Project</div>
                </div>
            )
        case "deprecated":
            return (
                <div className="flex items-center gap-1">
                    <div className="font-bender">Deprecated</div>
                </div>
            )
    }
}
