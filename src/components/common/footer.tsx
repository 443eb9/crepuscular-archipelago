import UnderlinedLink from "./underlined-link";

export default function Footer() {
    return (
        <div className="flex flex-col w-full font-bender italic text-light-dark-neutral text-sm">
            <p>
                Copyright 2024-2024 443eb9#C. All rights reserved.
            </p>
            <p>
                Built using <UnderlinedLink href="https://www.rust-lang.org/">Rust</UnderlinedLink> 🦀 and <UnderlinedLink href="https://nextjs.org/">Next.js</UnderlinedLink> ▲, with passion and love.
            </p>
            <p>Source code can be found on <UnderlinedLink href="https://github.com/443eb9/crepuscular-archipelago">Github</UnderlinedLink></p>
        </div>
    );
}
