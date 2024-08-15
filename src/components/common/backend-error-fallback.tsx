import { ErrorResponse } from "@/data/island";
import { ReactNode } from "react";
import EmphasizedBox from "./decos/emphasized-box";

export default function BackendErrorFallback({ className, children, error }: { className?: string, children?: ReactNode, error: ErrorResponse }) {
    const resp = error.error;

    return (
        <div className={className}>
            <EmphasizedBox thickness={2} length={10} className="font-bender p-2">
                <div className="">[FATAL][{new Date().toISOString()}]</div>
                {
                    resp == undefined
                        ? <div className="">The server didn't respond.</div>
                        : <div className="">
                            <div className="">Server responded with status: {resp.status} {resp.statusText}</div>
                            <div className="">Error message: {resp.data}</div>
                        </div>
                }
            </EmphasizedBox>

        </div>
    );
}
