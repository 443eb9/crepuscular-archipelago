import { FiGithub } from "react-icons/fi";
import OutlinedButton from "../common/outlined-button";
import { IoMailOutline } from "react-icons/io5";
import OutlinedBox from "../common/outlined-box";
import Link from "next/link";
import { Url } from "next/dist/shared/lib/router/router";

export default function MeInfo() {
    return (
        <OutlinedBox className="flex font-bender p-4">
            <div className="w-full h-full">
                <OutlinedBox className="w-full aspect-square bg-cover" style={{ backgroundImage: "url(https://img2.imgtp.com/2024/05/05/NQTv46Yr.jpg)" }}></OutlinedBox>
                <div className="flex flex-col mt-4">
                    <h1 className="font-bold text-4xl">443eb9#C</h1>
                    <h2 className="font-sh-serif font-bold text-lg">中国 浙江</h2>
                    <div className="flex gap-2 items-center text-xl">
                        <IoMailOutline></IoMailOutline>
                        <div className="">443eb9@gmail.com</div>
                    </div>
                    <div className="flex mt-2">
                        <SocialMediaButton href={"https://github.com/443eb9"}><FiGithub className="text-4xl"></FiGithub></SocialMediaButton>
                    </div>
                </div>
            </div>
        </OutlinedBox>
    );
}

function SocialMediaButton({ children, href }: { children: React.ReactNode, href: Url }) {
    return (
        <Link href={href}>
            <OutlinedButton className="w-16 h-16">
                {children}
            </OutlinedButton>
        </Link>
    );
}
