'use client'

import { useState } from "react";
import { IoMenuSharp } from "react-icons/io5";
import NavButtons from "./nav-buttons";
import EmphasizedBox from "../decos/emphasized-box";

export default function DropdownNav({ className }: { className?: string }) {
    const [isExpanded, setExpanded] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <button onClick={() => setExpanded(!isExpanded)}><IoMenuSharp className="text-4xl"></IoMenuSharp></button>
            <EmphasizedBox
                thickness={5}
                length={10}
                className={`z-20 p-2 top-16 ${isExpanded ? "block" : "hidden"}`}
                style={{
                    position: "absolute",
                    right: "calc(100% - 30px)"
                }}
            >
                <NavButtons
                    containerClassName="flex-col gap-2"
                    className="text-nowrap w-20 h-10 bg-dark-contrast dark:bg-light-contrast"
                >
                </NavButtons>
            </EmphasizedBox>
        </div>
    );
}
