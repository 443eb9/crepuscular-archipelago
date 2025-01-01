import { Response } from "@/data/api"
import EmphasizedBox from "./decos/emphasized-box"
import { ReactNode } from "react"

export default function NetworkErrorable<T>({ resp, children }: { resp: Response<T>, children: (data: T) => ReactNode }) {
    return resp.ok
        ? children(resp.data)
        : <EmphasizedBox thickness={2} length={10} className="font-bender p-2">
            <div>[FATAL][{new Date().toISOString()}]</div>
            <div>{resp.err}</div>
        </EmphasizedBox>
}
