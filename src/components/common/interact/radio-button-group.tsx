import { ReactNode } from "react"
import RadioButton from "./radio-button"

export default function RadioButtonGroup({ labels, enabled, className }: { labels: ReactNode[], enabled: number, className?: string }) {
    return (
        <div className={className}>
            {
                labels.map((node, i) =>
                    <RadioButton key={`radio button ${i}`} enabled={i == enabled}>
                        {node}
                    </RadioButton>
                )
            }
        </div>
    )
}
