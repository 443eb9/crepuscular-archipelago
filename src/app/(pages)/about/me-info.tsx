import { FiGithub } from "react-icons/fi"
import { IoMailOutline } from "react-icons/io5"
import { Url } from "next/dist/shared/lib/router/router"
import OutlinedBox from "@/components/outlined-box"
import OutlinedButton from "@/components/outlined-button"
import LinkNoPrefetch from "@/components/link-no-prefetch"

export default function MeInfo() {
    return (
        <OutlinedBox className="flex font-bender p-4">
            <div className="w-full h-full">
                <OutlinedBox className="w-full aspect-square bg-cover" style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/50186452)" }}></OutlinedBox>
                <div className="flex flex-col mt-4">
                    <h1 className="font-bold text-4xl">443eb9#C</h1>
                    <h2 className="font-sh-serif font-bold text-lg">中国 浙江</h2>
                    <div className="flex gap-2 items-center text-xl">
                        <IoMailOutline></IoMailOutline>
                        <div className="">443eb9@gmail.com</div>
                    </div>
                    <div className="flex mt-2">
                        <SocialMediaButton href={"https://github.com/443eb9"}><FiGithub className="text-lg" /></SocialMediaButton>
                    </div>
                </div>
            </div>
        </OutlinedBox>
    )
}

function SocialMediaButton({ children, href }: { children: React.ReactNode, href: Url }) {
    return (
        <LinkNoPrefetch href={href}>
            <OutlinedButton className="w-8 aspect-square">
                {children}
            </OutlinedButton>
        </LinkNoPrefetch>
    )
}
