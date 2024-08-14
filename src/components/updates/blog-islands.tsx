import { fetchIsland } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";
import { IslandMeta, IslandType } from "@/data/model";

export default async function BlogIslands({ islands, params }: { islands: IslandMeta[], params: URLSearchParams }) {
    let maybeContents: string[] = new Array(islands.length).fill('');
    for (let i = 0; i < islands.length; i++) {
        if (islands[i].ty == IslandType.Note) {
            // I know this is slow
            // But I'm lazy :p
            maybeContents[i] = (await fetchIsland(islands[i].id)).data.content;
        }
    }

    return (
        <div className="flex w-full flex-col gap-10">
            {
                islands.reverse().map((data, i) => {
                    if (data.ty == IslandType.Note) {
                        return (
                            <Suspense key={i}>
                                <IslandCard
                                    island={data}
                                    key={data.id}
                                    content={maybeContents[islands.length - 1 - i]}
                                    params={params}
                                ></IslandCard>
                            </Suspense>
                        );
                    } else {
                        return (
                            <Suspense key={i}>
                                <IslandCard
                                    island={data}
                                    key={data.id}
                                    params={params}
                                ></IslandCard>
                            </Suspense>
                        );
                    }
                }
                )
            }
        </div>
    );
}
