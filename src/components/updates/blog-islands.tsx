import { fetchIslandsMeta, fetchIslandsTags } from "@/data/island";
import IslandCard from "./island-card";

export default async function BlogIslands({ page, length }: { page: number, length: number }) {
    let cards = (await fetchIslandsMeta(page * length + 1, length));
    let tags = (await fetchIslandsTags(page * length + 1, length));

    return (
        <div className="flex w-full flex-col gap-10">
            {
                cards.reverse().map((data, i) =>
                    <IslandCard card={data} tags={tags[cards.length - i - 1]} key={data.id}></IslandCard>
                )
            }
        </div>
    );
}
