import OutlinedBox from "../common/outlined-box"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"

export default async function SelfIntro() {
    return (
        <OutlinedBox className="font-sh-sans p-4 md:p-10">
            <Markdown className="flex flex-col gap-2 cursor-text" rehypePlugins={[rehypeRaw]}>
                {String.raw`### Hi there 👋

I'm 443eb9#C, a developer from China who is constantly striving for improvement.

<hr>

*What does my name actually mean?*
- 443eb9 is a random color I picked in Photoshop. I selected it from a plethora of colors, so I feel like we have a connection.
- #C is the reverse representation of C#, which was my favorite language when I was a Unity developer. Also, "#" acts like a separator.

Currently, Rust 🦀 is my favorite language. It runs fast, is memory-safe, and easy to write. Rust macros, enums, and iterators are the best things ever! C# is my second favorite language. It doesn't run as fast, but it's even easier to write.

I aspire to become a full-stack open-source game developer in the future. Besides coding, I'm also delving into painting and *planning* to learn cloth/building designing and music composition.

[![Anurag's GitHub stats](https://github-readme-stats.vercel.app/api?username=443eb9)](https://github.com/anuraghazra/github-readme-stats)

### *共勉*
`}
            </Markdown>
        </OutlinedBox>
    )
}
