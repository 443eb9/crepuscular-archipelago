import Text from "./text"

export default function SpTag({ title }: Readonly<{ title: string }>) {
    return (
        <div className="bg-light-contrast dark:bg-dark-contrast text-dark-contrast dark:text-light-contrast p-1 h-full flex items-center">
            <Text className="text-sm">{title}</Text>
        </div>
    )
}
