'use client'

import { BookmarkData } from "@/data/model";
import Link from "next/link";
import OutlinedButton from "../common/interact/outlined-button";
import { useState } from "react";
import clsx from "clsx";

export default function ShaderPreview({ bookmarks }: { bookmarks: BookmarkData[] }) {
    const [isEnabled, setEnabled] = useState(false);

    return (
        <div>
            <OutlinedButton className={
                clsx(
                    "font-bender text-2xl px-3 py-1",
                    { "hidden": isEnabled }
                )
            }
            onClick={() => setEnabled(true)}
            >
                Click to enable
            </OutlinedButton>
            <div className={clsx(
                "grid grid-cols-1 md:grid-cols-2 gap-5",
                { "hidden": !isEnabled }
            )}>
                {
                    bookmarks.map((shader, i) =>
                        <div key={i} className="relative">
                            <Link href={shader.link} className="absolute text-2xl ml-2 font-bender font-bold mix-blend-difference" target="_blank">#{i}</Link>
                            <iframe
                                allowFullScreen
                                className="w-full h-60"
                                src={`https://www.shadertoy.com/embed/${shader.link.split("view/")[1]}?gui=false&t=10&paused=false&muted=false`}
                            ></iframe>
                        </div>
                    )
                }
            </div>
        </div >
    );
}
