export default function ContentWrapper({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <div className="flex justify-center">
            <div className={`flex px-5 max-w-[1080px] w-full ${className}`}>
                {children}
            </div>
        </div>
    )
}
