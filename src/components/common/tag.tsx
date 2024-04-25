export default function Tag({ tag }: { tag: string }) {
    return (
        <div className="border-neutral-50 border-2 p-1">
            {tag}
        </div>
    );
}
