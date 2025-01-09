import Image from "next/image"
import Link from "next/link"

export default function License() {
    return (
        <Link href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" className="flex gap-1 justify-between items-center">
            <div className="font-bender font-bold text-small text-nowrap">CC BY-NC 4.0</div>
            <div className="flex gap-1 dark:invert">
                <div className="relative w-5 aspect-square">
                    <Image src="/images/ccicons/cc.svg" alt="cc" fill></Image>
                </div>
                <div className="relative w-5 aspect-square">
                    <Image src="/images/ccicons/by.svg" alt="cc" fill></Image>
                </div>
                <div className="relative w-5 aspect-square">
                    <Image src="/images/ccicons/nc.svg" alt="cc" fill></Image>
                </div>
            </div>
        </Link>
    )
}
