import { ErrorResponse } from "@/data/requests";
import EmphasizedBox from "./decos/emphasized-box";

export default function NetworkErrorFallback({ className, error }: { className?: string, error: ErrorResponse }) {
    const resp = error.error;

    return (
        <div className={className}>
            <EmphasizedBox thickness={2} length={10} className="font-bender p-2">
                <div>[FATAL][{new Date().toISOString()}]</div>
                {
                    resp == undefined
                        ? <div>The server did not respond.</div>
                        : <div>
                            <div>Server responded with status: {resp.status} {resp.statusText}</div>
                            <div>Error message: {resp.data}</div>
                        </div>
                }
            </EmphasizedBox>

        </div>
    );
}
