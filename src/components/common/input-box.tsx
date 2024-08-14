export default function InputBox({ className, placeholder, name }: { className?: string, placeholder?: string, name?: string }) {
    return (
        <div className="w-full h-full">
            <input
                type="text"
                name={name}
                className={`
                    w-full p-1 h-full bg-transparent outline-none border-b-2
                    border-light-unfocused dark:border-dark-unfocused focus:border-light-contrast
                    focus:dark:border-dark-contrast placeholder:font-bender ${className}`}
                placeholder={placeholder}
            />
        </div>
    );
}
