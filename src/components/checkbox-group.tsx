import { ReactNode } from "react"
import Checkbox from "./checkbox"

export default function CheckboxGroup({ labels, enabled, className }: { labels: ReactNode[], enabled: number[], className?: string }) {
    return (
        <div className={className}>
            {
                labels.map((node, i) =>
                    <Checkbox key={`radio button ${i}`} enabled={enabled.some(x => x == i)}>
                        {node}
                    </Checkbox>
                )
            }
        </div>
    )
}
