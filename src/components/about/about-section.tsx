import { ReactNode } from "react";
import DiagLines from "../common/decos/diag-lines";
import ZhEnLabel from "../common/zh-en-label";

export default function AboutSection({ title, enTitle, children }: { title: string, enTitle: string, children: ReactNode }) {
    return (
        <div className="">
            <div className="flex gap-2">
                <DiagLines scale="400%" className="w-10"></DiagLines>
                <ZhEnLabel
                    zh={title}
                    en={enTitle}
                    className="flex-col"
                    zhClassName="text-5xl font-sh-serif font-bold"
                    enClassName="text-4xl font-bender italic"
                ></ZhEnLabel>
            </div>
            <div className="flex gap-5 mt-2">
                <div className="w-48 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
                <div className="w-16 h-2 bg-light-contrast dark:bg-dark-contrast"></div>
            </div>
            {children}
        </div>
    );
}