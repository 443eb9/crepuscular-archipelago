"use client"

import OutlinedBox from "@/components/outlined-box"
import Text from "@/components/text"
import { FriendDialogData } from "@/data/model"
import Image from "next/image"
import React, { useState } from "react"
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5"

export default function FriendDialog({ dialog }: { dialog: FriendDialogData[] }) {
    const [page, setPage] = useState(0)

    const paragraph = dialog[page]

    return (
        <OutlinedBox className="bg-light-background dark:bg-dark-background p-2">
            <div className="flex gap-2">
                <div className="flex justify-between items-center">
                    <div className="relative w-24 aspect-square">
                        <Image src={paragraph.expression} alt="Expression" fill unoptimized />
                    </div>
                </div>
                <div className="relative w-full">
                    {
                        paragraph.customHtml != undefined
                            ? <div dangerouslySetInnerHTML={{ __html: paragraph.customHtml }} />
                            : <Text>{paragraph.content}</Text>
                    }
                    <div className="absolute bottom-0 right-0 flex gap-1">
                        {
                            page > 0 &&
                            <button className="w-4" onClick={() => setPage(page - 1)}>
                                <IoArrowBackOutline />
                            </button>
                        }
                        {
                            page < dialog.length - 1
                                ? <button className="w-4" onClick={() => setPage(page + 1)}>
                                    <IoArrowForwardOutline />
                                </button>
                                : <div className="w-4" />
                        }
                    </div>
                </div>
            </div>
        </OutlinedBox>
    )
}
