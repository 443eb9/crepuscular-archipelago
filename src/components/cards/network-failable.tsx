import { ReactNode } from "react";
import useSWR, { SWRResponse } from "swr";

export default function NetworkFailable<T>({ swrResp, loading, children }: { swrResp: SWRResponse<T>, loading: ReactNode, children: (data: T) => ReactNode }) {
    const { data, error, isLoading } = swrResp

    if (error) {
        console.log(error)
        return <div className="">ERR: {error.message}</div>
    }

    if (isLoading) {
        return loading
    }

    if (!data) {
        return <div className=""></div>
    }

    return children(data)
}
