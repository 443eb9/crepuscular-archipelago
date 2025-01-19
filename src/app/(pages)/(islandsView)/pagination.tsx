"use client"

import OutlinedButton from "@/components/outlined-button";
import Text from "@/components/text";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ total, current, buttonSize }: { total: number, current: number, buttonSize: number }) {
    const router = useRouter()
    const searchParams = new URLSearchParams(useSearchParams())
    const pathname = usePathname()

    return (
        <>
            {
                Array.from(Array(total).keys()).map(page =>
                    <OutlinedButton
                        key={page}
                        className={clsx(
                            `aspect-square
                            ${current == page ? "text-dark-contrast dark:text-light-contrast" : ""}`,
                            { "bg-light-contrast dark:bg-dark-contrast": current == page }
                        )}
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.set("page", page.toString())
                            router.replace(`${pathname}?${params}`)
                        }}
                        style={{
                            width: `${buttonSize}px`
                        }}
                    >
                        <Text
                            className="font-bender text-2xl font-bold"
                            noFont
                        >
                            {page}
                        </Text>
                    </OutlinedButton>
                )
            }
        </>
    )
}
