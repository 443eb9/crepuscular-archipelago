import Image from "next/image";
import OutlinedBox from "../common/outlined-box";

export default function LinkExchange() {
    return (
        <OutlinedBox className="w-full">
            <LinkElement
                avatar=""
                name="Lumither's site"
                link="https://lumither.com/"
            ></LinkElement>
        </OutlinedBox>
    );
}

function LinkElement({ avatar, name, link }: { avatar: string, name: string, link: string }) {
    return (
        <div className="">
            <Image src={avatar} width={100} height={100} alt={name}></Image>
            <h4></h4>
        </div>
    );
}
