export default function EndpointDottedSegment({ thickness, dotSize, style }: { thickness: number, dotSize: number, style: "solid" | "dashed" | "dotted" }) {
    return (
        <div className="flex justify-between items-center w-full">
            <div
                className="bg-neutral-900 dark:bg-neutral-50 aspect-square"
                style={{
                    width: dotSize
                }}>
            </div>
            <div
                className="w-full h-0 border-neutral-900 dark:border-neutral-50"
                style={{
                    borderTopWidth: thickness,
                    borderStyle: style
                }}>
            </div>
            <div
                className="bg-neutral-900 dark:bg-neutral-50 aspect-square"
                style={{
                    width: dotSize
                }}>
            </div>
        </div>
    );
}
