import { HTMLAttributes } from "react";

export default function ContentWrapper(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className="flex justify-center w-[100vw]">
            <div {...props} className={`flex px-5 max-w-[1080px] w-full ${props.className}`}>
                {props.children}
            </div>
        </div>
    )
}
