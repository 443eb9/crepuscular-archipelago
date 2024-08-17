import Image from "next/image";

export default function NextImage({ className, unoptimized, src, alt }: { className?: string, unoptimized?: boolean, src: string, alt: string }) {
    return (
        <Image
            className={className}
            src={src}
            alt={alt}
            draggable={false}
            style={{
                width: "100%",
                height: "auto"
            }}
            sizes="100vw"
            width={0}
            height={0}
            // unoptimized={unoptimized}
            unoptimized
        >
        </Image>
    );
}
