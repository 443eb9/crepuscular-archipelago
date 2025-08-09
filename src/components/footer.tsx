import Link from "next/link";
import ContentWrapper from "./content-wrapper";
import AsciiText from "./text/ascii-text";

export default function Footer() {
    return (
        <ContentWrapper className="mt-8 mb-16">
            <div className="flex flex-col w-full font-bender italic opacity-50 text-sm">
                <AsciiText>
                    Copyright 2024-2025 443eb9#C. Articles and images are protected by their respective licenses.
                </AsciiText>
                <AsciiText>
                    Built using <Link target="_blank" className="underline" href="https://www.rust-lang.org/">Rust</Link> 🦀 and <Link target="_blank" className="underline" href="https://nextjs.org/">Next.js</Link> ▲, with <span className="text-accent-0">passion</span> and <span className="text-accent-1">love</span>.
                </AsciiText>
                <AsciiText>Source code published on <Link target="_blank" className="underline" href="https://github.com/443eb9/crepuscular-archipelago">Github</Link> under MIT license.</AsciiText>
            </div>
        </ContentWrapper>
    )
}
