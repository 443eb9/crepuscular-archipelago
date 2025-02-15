import DiagLines from "@/components/decos/diag-lines"
import Text from "@/components/text"
import { ReactNode } from "react"

export default function AboutSection({ title, children }: { title: string, children: ReactNode }) {
    return (
        <div className="">
            <div className="flex gap-2">
                <DiagLines scale="400%" className="w-10"></DiagLines>
                <Text className="flex-col text-5xl font-sh-serif font-bold">{title}</Text>
            </div>
            <div className="flex gap-5 mt-2">
                <div className="w-48 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
                <div className="w-16 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
            </div>
            {children}
        </div>
    )
}
