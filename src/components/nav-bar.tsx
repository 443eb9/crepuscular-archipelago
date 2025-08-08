import Link from "next/link";
import OutlinedButton from "./outlined-button";
import TitleText from "./text/title-text";

export default function NavBar() {
    return (
        <>
            <OutlinedButton className="w-20 h-10 flex justify-center items-center">
                <TitleText>
                    <Link href="/updates">动态</Link>
                </TitleText>
            </OutlinedButton>
        </>
    )
}
