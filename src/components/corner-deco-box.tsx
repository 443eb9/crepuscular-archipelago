import { HTMLAttributes, ReactNode } from "react";

export default function CornerDecoBox({
    deco, decoSize, lineThickness, decoGap, noOutline, tl, tr, bl, br, ...props
}: {
    deco: ReactNode, decoSize: number, lineThickness: number, decoGap: number, noOutline?: boolean, tl?: ReactNode, tr?: ReactNode, bl?: ReactNode, br?: ReactNode
} & HTMLAttributes<HTMLDivElement>
) {
    const half = decoSize / 2
    const decoAllGapped = decoGap * 2

    return (
        <div className="relative">
            {
                !noOutline &&
                <>
                    <div className="bg-dark-0 dark:bg-light-0" style={{ position: "absolute", width: `${lineThickness}px`, height: `calc(100% - ${decoAllGapped}px)`, top: `${decoGap}px` }} />
                    <div className="bg-dark-0 dark:bg-light-0" style={{ position: "absolute", width: `${lineThickness}px`, height: `calc(100% - ${decoAllGapped}px)`, left: "100%", top: `${decoGap}px` }} />
                    <div className="bg-dark-0 dark:bg-light-0" style={{ position: "absolute", height: `${lineThickness}px`, width: `calc(100% - ${decoAllGapped}px)`, left: `${decoGap}px` }} />
                    <div className="bg-dark-0 dark:bg-light-0" style={{ position: "absolute", height: `${lineThickness}px`, width: `calc(100% - ${decoAllGapped}px)`, top: "100%", left: `${decoGap}px` }} />
                </>
            }

            <div style={{ position: "absolute", left: `-${half}px`, top: `-${half}px` }}>{tl ? tl : deco}</div>
            <div style={{ position: "absolute", right: `-${half}px`, top: `-${half}px` }}>{tr ? tr : deco}</div>
            <div style={{ position: "absolute", left: `-${half}px`, bottom: `-${half}px` }}>{bl ? bl : deco}</div>
            <div style={{ position: "absolute", right: `-${half}px`, bottom: `-${half}px` }}>{br ? br : deco}</div>

            {props.children}
        </div>
    )
}
