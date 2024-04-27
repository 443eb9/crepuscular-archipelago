import { fetchAllCards } from "@/data/card";
import ContentCard from "./content-card";

export default async function BlogArticles() {
    let cards = await fetchAllCards();

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
