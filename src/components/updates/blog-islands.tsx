import { fetchIslandsMeta, fetchIslandsTags } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";

export default async function BlogIslands({ page, length, tagsFilter }: { page: number, length: number, tagsFilter: number }) {
    let islands = await fetchIslandsMeta(page * length + 1, length, tagsFilter);
    let allTags = await fetchIslandsTags(page * length + 1, length, tagsFilter);

    return (
        <div className="flex w-full flex-col gap-10">
            {
                islands.reverse().map((data, i) =>
                    <Suspense>
                        <IslandCard island={data} tags={allTags[islands.length - i - 1]} key={data.id}></IslandCard>
                    </Suspense>
                )
            }
        </div>
    );
}
