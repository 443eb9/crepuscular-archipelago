import axios from "axios";
import OutlinedBox from "../common/outlined-box";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default async function SelfIntro() {
    const selfIntroMd = await axios.get("https://raw.githubusercontent.com/443eb9/443eb9/main/README.md");

    return (
        <OutlinedBox className="font-sh-sans p-4 md:p-10">
            <Markdown className="flex flex-col gap-2 cursor-text" rehypePlugins={[rehypeRaw]}>{selfIntroMd.data}</Markdown>
        </OutlinedBox>
    );
}
