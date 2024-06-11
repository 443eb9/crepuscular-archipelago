import { fetchIslandsMeta } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";
import { IslandMeta } from "@/data/model";

export default async function BlogIslands({ page, length, tagsFilter }: { page: number, length: number, tagsFilter: number }) {
    let islands: IslandMeta[] = (await fetchIslandsMeta(page * length + 1, length, tagsFilter)).data;

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
