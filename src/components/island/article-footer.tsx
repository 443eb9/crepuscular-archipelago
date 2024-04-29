import Link from "next/link";
import OutlinedBox from "../common/outlined-box";

export default function ArticleFooter() {
    return (
        <div>
            <Link href={"/updates"}>
                <OutlinedBox className="font-argon font-bold text-4xl p-5">
                    &lt; $ cd .._
                </OutlinedBox>
            </Link>
        </div>
    );
}
