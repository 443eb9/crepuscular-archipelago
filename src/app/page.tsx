import { redirect, RedirectType } from "next/navigation";

export default function Home() {
	redirect("/updates", RedirectType.push)
}
