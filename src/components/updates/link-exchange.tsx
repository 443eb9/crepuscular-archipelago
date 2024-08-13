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
            
            <a target="_blank">{name}</a>
        </div>
    );
}
