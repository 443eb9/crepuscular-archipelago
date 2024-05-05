import { fetchIslandsMeta } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";

export default async function BlogIslands({ page, length, tagsFilter }: { page: number, length: number, tagsFilter: number }) {
    let islands = await fetchIslandsMeta(page * length + 1, length, tagsFilter);

    return (
        <div className="flex w-full flex-col gap-10">
            {
                islands.reverse().map((data, i) =>
                    <Suspense key={i}>
                        <IslandCard island={data} key={data.id}></IslandCard>
                    </Suspense>
                )
            }
        </div>
    );
}
