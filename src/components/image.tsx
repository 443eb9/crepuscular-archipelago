"use client"

import NextImage, { ImageProps } from "next/image"
import { HTMLAttributes, useEffect, useRef, useState } from "react"

export default function Image({ scale, containerProps, ...props }: { scale: number, containerProps?: HTMLAttributes<HTMLDivElement> } & ImageProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState<number | undefined>()

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth)
        }
    }, [])

    return (
        <div
            {...containerProps}
            ref={containerRef}
            className={`flex justify-center ${containerProps?.className}`}
        >
            {
                containerWidth &&
                <NextImage
                    {...props}
                    width={containerWidth * scale}
                    height={0}
                    placeholder="empty"
                />
            }
        </div>
    )
}
