import { ErrorResponse, fetchIsland } from "@/data/island";
import IslandCard from "./island-card";
import { Suspense } from "react";
import { IslandMeta, IslandType } from "@/data/model";
import BackendErrorFallback from "../common/backend-error-fallback";
import MarkdownContainer from "../common/markdown-container";

export default async function BlogIslands({ islands, params }: { islands: IslandMeta[], params: URLSearchParams }) {
    let maybeContents = new Array(islands.length).fill('');
    for (let i = 0; i < islands.length; i++) {
        if (islands[i].ty == IslandType.Note) {
            // I know this is slow
            // But I'm lazy :p
            const response = await fetchIsland(islands[i].id);
            if (response instanceof ErrorResponse) {
                maybeContents[i] = <BackendErrorFallback error={response}></BackendErrorFallback>;
            } else {
                maybeContents[i] = <MarkdownContainer body={response.data.content}></MarkdownContainer>;
            }
        }
    }

    return (
        <div className="flex w-full flex-col gap-10">
            {
                islands instanceof ErrorResponse
                    ? <BackendErrorFallback error={islands}></BackendErrorFallback>
                    : islands.reverse().map((data, i) =>
                        <Suspense key={i}>
                            <IslandCard
                                island={data}
                                key={data.id}
                                content={data.ty == IslandType.Note ? maybeContents[islands.length - 1 - i] : undefined}
                                params={params}
                            ></IslandCard>
                        </Suspense>
                    )
            }
        </div>
    );
}
