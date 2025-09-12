import { HTMLMotionProps, motion, useMotionValue } from "motion/react";
import { useContext, useEffect, useState } from "react";
import { islandGridContext } from "./islands-map";
import { Vector2 } from "three";
import { GridSettings } from "./main-canvas";

export default function CanvasRelatedPanel({ posX, posY, followScale, ...props }: { posX: number, posY: number, followScale?: boolean } & HTMLMotionProps<"div">) {
    const { canvasSize, canvasTransform } = useContext(islandGridContext)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const scale = useMotionValue(1)

    const [updateFlag, setUpdateFlag] = useState(false)

    useEffect(() => {
        const updateHandler = () => {
            if (followScale) {
                scale.set(1 / canvasTransform.scale)
            }

            const translation = canvasTransform.translation.clone()
            const size = new Vector2(canvasSize.width, canvasSize.height)

            const uv = new Vector2(posX, posY)
                .multiplyScalar(GridSettings.cellSize)
                .sub(translation)
                .divide(size)
                .divideScalar(0.5 * canvasTransform.scale)
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
    }, [updateFlag, followScale, posX, posY])

    useEffect(() => {
        const resizeHandler = () => {
            // TODO need to wait for a while or the component will rerender before canvasSize gets updated.
            //      but this is not elegant
            setTimeout(() => {
                setUpdateFlag(!updateFlag)
            }, 100)
        }

        window.addEventListener("resize", resizeHandler)
        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [updateFlag])

    return (
        <motion.div
            {...props}
            className={`absolute bg-light-background dark:bg-dark-background ${props.className}`}
            style={{
                ...props.style,
                x,
                y,
                scale,
            }}
        />
    )
}
