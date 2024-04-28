export default function ContentWrapper({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={`flex pl-5 pr-5 md:pl-0 md:pr-0 max-w-[1080px] ${className}`}>
            {children}
        </div>
    );
}