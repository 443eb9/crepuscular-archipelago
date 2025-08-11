import { Response } from "@/data/api";
import { ReactNode, Suspense } from "react";
import AsciiText from "./text/ascii-text";
import CornerDecoBox from "./corner-deco-box";
import RectDot from "./rect-dot";

const Err = ({ err }: { err: string }) => <CornerDecoBox
    deco={{ node: <RectDot size={10} /> }}
    decoSize={10}
    decoGap={10}
    lineThickness={1}
    noOutline
>
    <div className="bg-dark-0 dark:bg-light-0 p-2 flex flex-col gap-2">
        <AsciiText className="" inv>{err}</AsciiText>
        <div className="w-full h-1 bg-accent-0" />
    </div>
</CornerDecoBox>

export function NetworkFailable<T>({ promise, loading, onErr, children }: { promise: Promise<Response<T>>, loading: ReactNode, onErr?: () => void, children: (data: T) => ReactNode }) {
    const Handler = async () => {
        const resp = await promise
        if (!resp.ok) {
            onErr?.()
            return <Err err={resp.err} />
        }

        return children(resp.data)
    }

    return <Suspense fallback={loading}><Handler /></Suspense>
}

export function NetworkFailableSync<T>({ response, onErr, children }: { response: Response<T>, onErr?: () => void, children: (data: T) => ReactNode }) {
    if (!response.ok) {
        onErr?.()
        return <Err err={response.err} />
    }
    return children(response.data)
}
