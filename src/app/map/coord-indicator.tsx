"use client"

import { useContext, useEffect, useState } from "react";
import { islandGridContext } from "./islands-map";
import { Vector2 } from "three";
import { GridSettings } from "./main-canvas";
import AsciiText from "@/components/text/ascii-text";

export default function CoordIndicator() {
    const { canvasSize, canvasTransform, cursor } = useContext(islandGridContext)
    const [pos, setPos] = useState<Vector2 | undefined>()

    useEffect(() => {
        const updater = () => {
            const translation = canvasTransform.translation.clone()
            const scale = canvasTransform.scale
            const size = new Vector2(canvasSize.width, canvasSize.height)
            const px = cursor.clone()
                .multiplyScalar(0.5)
                .multiply(size)
                .multiplyScalar(scale)
                .add(translation)
            const grid = px.divideScalar(GridSettings.cellSize).floor()
            setPos(new Vector2(grid.x, grid.y - 1))
        }

        document.addEventListener("mousemove", updater)
        document.addEventListener("wheel", updater)

        return () => {
            document.removeEventListener("mousemove", updater)
            document.removeEventListener("wheel", updater)
        }
    }, [])

    if (!pos) {
        return <></>
    }

    return (
        <div>
            <AsciiText>{pos.x}, {pos.y}</AsciiText>
        </div>
    )
}
