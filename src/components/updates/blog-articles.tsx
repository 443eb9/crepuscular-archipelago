import { fetchAllMeta } from "@/data/island";
import ContentCard from "./content-card";

export default async function BlogArticles() {
    let cards = await fetchAllMeta();

    return (
        <div className="flex flex-col gap-10">
            {
                cards.map((data) =>
                    <ContentCard card={data} key={data.id}></ContentCard>
                )
            }
        </div>
    );
}
