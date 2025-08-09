import { Response } from "@/data/api";
import { ReactNode, Suspense } from "react";
import AsciiText from "./text/ascii-text";

export default function NetworkFailable<T>({ promise, loading, children }: { promise: Promise<Response<T>>, loading: ReactNode, children: (data: T) => ReactNode }) {
    const Handler = async () => {
        const resp = await promise
        if (!resp.ok) return <AsciiText className="">{resp.err}</AsciiText>
        return children(resp.data)
    }

    return <Suspense fallback={loading}><Handler /></Suspense>
}
