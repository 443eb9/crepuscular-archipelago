import { fetchIslandsMeta } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";
import { IslandMeta } from "@/data/model";
import toast from "react-hot-toast";
import Toast from "../common/toast";

export default async function BlogIslands({ page, length, tagsFilter }: { page: number, length: number, tagsFilter: number }) {
    let islands: IslandMeta[] = await fetchIslandsMeta(page * length + 1, length, tagsFilter)
        .catch((reason) => {
            const data = reason["response"]["data"];
            toast.custom(<Toast title="Error" toast={data == undefined ? reason.toString() : data}></Toast>)
        })
        .then((value) => {
            if (value == null) {
                return;
            }
            return value.data;
        });

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
