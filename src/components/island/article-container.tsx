'use client';

import { useSearchParams } from "next/navigation";
import Article from "./article";
import { Suspense } from "react";

export default async function ArticleContainer() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? "-1";

    return (
        <Suspense>
            <Article id={Number.parseInt(id)}></Article>
        </Suspense>
    );
}
