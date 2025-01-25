import CanvasRelatedPanel from "./canvas-related-panel";
import { TbApple } from "react-icons/tb";
import { GridSettings } from "./main-canvas";

export default function BadAppleEntrance({ enter }: { enter: () => void }) {
    const theta = Math.random() * Math.PI * 2
    const t = Math.pow(Math.random(), 2)
    const rho = 500 * t + (1 - t) * 5000
    const x = Math.cos(theta) * rho
    const y = Math.sin(theta) * rho

    return (
        <CanvasRelatedPanel
            posX={x / GridSettings.cellSize}
            posY={y / GridSettings.cellSize}
            followScale
            className="z-20"
            noBg
        >
            <TbApple className="text-2xl opacity-5" onClick={enter} />
        </CanvasRelatedPanel>
    )
}
