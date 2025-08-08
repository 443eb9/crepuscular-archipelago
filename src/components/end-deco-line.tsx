import { HTMLAttributes, ReactNode } from "react";

export default function EndDecoLine({
    deco, decoSize, lineThickness, decoGap, vertical, lineStyle, ...props
}: {
    deco: ReactNode, decoSize: number, lineThickness: number, decoGap: number, vertical?: boolean, lineStyle?: "dashed" | "dotted" | "double" | "groove" | "hidden" | "inset" | "none" | "outset" | "ridge" | "solid"
} & HTMLAttributes<HTMLDivElement>
) {
    const decoAllGapped = decoGap * 2

    return (
        <div {...props} className={`flex items-center justify-center ${vertical ? "flex-col" : "flex-row"} ` + props.className} style={{ gap: `${decoGap}px`, height: `${decoSize}px` }}>
            {deco}
            <div
                className="border-dark-0 dark:border-light-0 border"
                style={{
                    width: vertical ? `0` : `calc(100% - ${decoAllGapped}px)`,
                    height: vertical ? `calc(100% - ${decoAllGapped}px)` : `0`,
                    borderStyle: lineStyle,
                    borderWidth: `${lineThickness}px`
                }}
            />
            {deco}
        </div>
    )
}
