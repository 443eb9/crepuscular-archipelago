export default function InputBox({ className, placeholder, name }: { className?: string, placeholder?: string, name?: string }) {
    return (
        <div className="w-full h-full">
            <input type="text" name={name} className={`w-full p-1 h-full bg-transparent outline-none border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 focus:dark:border-neutral-50 placeholder:font-bender ${className}`} placeholder={placeholder} />
        </div>
    );
}
