import { HTMLMotionProps, motion, useMotionValue } from "motion/react";
import { useContext, useEffect, useState } from "react";
import { islandGridContext } from "./islands-map";
import { Vector2 } from "three";
import { GridSettings } from "./main-canvas";
import clsx from "clsx";

export default function CanvasRelatedPanel({ posX, posY, noBg, ...props }: { posX: number, posY: number, noBg?: boolean } & HTMLMotionProps<"div">) {
    const { canvasSize, canvasTransform } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const [updateFlag, setUpdateFlag] = useState(false)

    useEffect(() => {
        const updateHandler = () => {
            const translation = canvasTransform.translation.clone()
            const scale = canvasTransform.scale
            const size = new Vector2(canvasSize.width, canvasSize.height)

            const uv = new Vector2(posX, posY)
                .multiplyScalar(GridSettings.cellSize)
                .sub(translation)
                .divide(size)
                .divideScalar(0.5 * scale)
                .addScalar(1)
                .multiplyScalar(0.5)
            const pixel = new Vector2(uv.x, 1 - uv.y).multiply(size)
            x.set(pixel.x)
            y.set(pixel.y)
        }

        updateHandler()

        document.addEventListener("mousemove", updateHandler)
        document.addEventListener("mousedown", updateHandler)
        document.addEventListener("wheel", updateHandler)

        return () => {
            document.removeEventListener("mousemove", updateHandler)
            document.removeEventListener("mousedown", updateHandler)
            document.removeEventListener("wheel", updateHandler)
        }
    }, [updateFlag])

    useEffect(() => {
        const resizeHandler = () => {
            setUpdateFlag(!updateFlag)
        }

        window.addEventListener("resize", resizeHandler)
        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])

    return (
        <motion.div
            {...props}
            className={clsx(
                `absolute ${props.className}`,
                { "bg-light-background dark:bg-dark-background": !noBg }
            )}
            style={{
                ...props.style,
                x,
                y,
            }}
        />
    )
}
