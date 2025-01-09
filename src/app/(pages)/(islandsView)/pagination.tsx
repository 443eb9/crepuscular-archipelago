"use client"

import OutlinedButton from "@/components/outlined-button";
import Text from "@/components/text";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ total, current }: { total: number, current: number }) {
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
                            `w-12 aspect-square
                            ${current == page ? "text-light-contrast" : "dark:text-dark-contrast"}`,
                            { "bg-light-contrast dark:bg-dark-contrast": current == page }
                        )}
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.set("page", page.toString())
                            router.replace(`${pathname}?${params}`)
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
