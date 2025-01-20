export default function ContentWrapper({ children, containerClassName, className }: { children?: React.ReactNode, containerClassName?: string, className?: string }) {
    return (
        <div className={`flex justify-center ${containerClassName}`}>
            <div className={`flex px-5 max-w-[1080px] w-full ${className}`}>
                {children}
            </div>
        </div>
    )
}
