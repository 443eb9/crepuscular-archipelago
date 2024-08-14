export default function EndpointDottedSegment(
    {
        thickness, dotSize, style, className
    }: {
        thickness: number, dotSize: number, style: "solid" | "dashed" | "dotted", className?: string
    }
) {
    return (
        <div className={`flex justify-between items-center w-full ${className}`}>
            <div
                className="bg-light-contrast dark:bg-dark-contrast aspect-square"
                style={{
                    width: dotSize,
                }}>
            </div>
            <div
                className="w-full h-0 border-light-contrast dark:border-dark-contrast"
                style={{
                    borderTopWidth: thickness,
                    borderStyle: style,
                }}>
            </div>
            <div
                className="bg-light-contrast dark:bg-dark-contrast aspect-square"
                style={{
                    width: dotSize,
                }}>
            </div>
        </div>
    );
}
