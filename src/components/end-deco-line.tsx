import { HTMLAttributes, ReactNode } from "react";

export default function EndDecoLine({
    deco, decoSize, lineThickness, decoGap, vertical, ...props
}: {
    deco: ReactNode, decoSize: number, lineThickness: number, decoGap: number, vertical?: boolean
} & HTMLAttributes<HTMLDivElement>
) {
    const decoAllGapped = decoGap * 2

    return (
        <div {...props} className={`flex items-center justify-center ${vertical ? "flex-col" : "flex-row"} ` + props.className} style={{ gap: `${decoGap}px`, height: `${decoSize}px` }}>
            {deco}
            <div
                className="bg-dark-0 dark:bg-light-0"
                style={{
                    width: vertical ? `${lineThickness}px` : `calc(100% - ${decoAllGapped}px)`,
                    height: vertical ? `calc(100% - ${decoAllGapped}px)` : `${lineThickness}px`,
                }}
            />
            {deco}
        </div>
    )
}
