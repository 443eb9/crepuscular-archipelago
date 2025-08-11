import { HTMLAttributes, ReactNode } from "react";

type CornerDecoProps = {
    node?: ReactNode,
    lineStyle?: "dashed" | "dotted" | "double" | "groove" | "hidden" | "inset" | "none" | "outset" | "ridge" | "solid"
}

export default function CornerDecoBox({
    deco, decoSize, lineThickness, decoGap, noOutline, tl, tr, bl, br, ...props
}: {
    deco?: CornerDecoProps, decoSize: number, lineThickness: number, decoGap: number, noOutline?: boolean, tl?: CornerDecoProps, tr?: CornerDecoProps, bl?: CornerDecoProps, br?: CornerDecoProps
} & HTMLAttributes<HTMLDivElement>
) {
    const half = decoSize / 2

    const _tl = tl?.node ?? deco?.node
    const _tr = tr?.node ?? deco?.node
    const _bl = bl?.node ?? deco?.node
    const _br = br?.node ?? deco?.node

    const compute = (a: ReactNode | undefined, b: ReactNode | undefined) => {
        if (a && b) {
            return [`calc(100% - ${decoGap * 2}px)`, `${decoGap}px`]
        } else if (a) {
            return [`calc(100% - ${decoGap}px)`, `${decoGap}px`]
        } else if (b) {
            return [`calc(100% - ${decoGap}px)`, `0`]
        } else {
            return [`100%`, `0`]
        }
    }

    const top = compute(_tl, _tr)
    const right = compute(_tr, _br)
    const bottom = compute(_bl, _br)
    const left = compute(_tl, _bl)

    return (
        <div {...props} className={"relative " + props.className}>
            {
                !noOutline &&
                <>
                    <div className="absolute border-dark-0 dark:border-light-0" style={{ borderTopWidth: `${lineThickness}px`, borderStyle: tl?.lineStyle ?? deco?.lineStyle, width: top[0], left: top[1] }} />
                    <div className="absolute border-dark-0 dark:border-light-0" style={{ borderRightWidth: `${lineThickness}px`, borderStyle: tr?.lineStyle ?? deco?.lineStyle, height: right[0], top: right[1], right: "0" }} />
                    <div className="absolute border-dark-0 dark:border-light-0" style={{ borderBottomWidth: `${lineThickness}px`, borderStyle: br?.lineStyle ?? deco?.lineStyle, width: bottom[0], left: bottom[1], bottom: "0" }} />
                    <div className="absolute border-dark-0 dark:border-light-0" style={{ borderLeftWidth: `${lineThickness}px`, borderStyle: bl?.lineStyle ?? deco?.lineStyle, height: left[0], top: left[1] }} />
                </>
            }

            <div style={{ position: "absolute", left: `-${half}px`, top: `-${half}px` }}>{_tl}</div>
            <div style={{ position: "absolute", right: `-${half}px`, top: `-${half}px` }}>{_tr}</div>
            <div style={{ position: "absolute", left: `-${half}px`, bottom: `-${half}px` }}>{_bl}</div>
            <div style={{ position: "absolute", right: `-${half}px`, bottom: `-${half}px` }}>{_br}</div>

            {props.children}
        </div>
    )
}
