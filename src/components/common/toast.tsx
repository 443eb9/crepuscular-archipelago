import OutlinedBox from "./outlined-box"

export default function Toast({ title, toast }: { title: string, toast: string }) {
    return (
        <OutlinedBox className="min-w-48 max-w-96 font-sh-sans p-3 backdrop-blur-md">
            <div className="font-bold font-bender text-xl">{title}</div>
            <div className="">{toast}</div>
        </OutlinedBox>
    )
}
