import { Response } from "@/data/api";
import { ReactNode, Suspense } from "react";

export default function NetworkFailable<T>({ promise, loading, children }: { promise: Promise<Response<T>>, loading: ReactNode, children: (data: T) => ReactNode }) {
    const Handler = async () => {
        const resp = await promise
        if (!resp.ok) return <div className="">{resp.err}</div>
        return children(resp.data)
    }

    return <Suspense fallback={loading}><Handler /></Suspense>
}
