import { Metadata } from 'next'

export const metadata: Metadata = {
	title: "443eb9#C - Crepuscular Archipelago",
	description: "443eb9#C's blog - Islands that owned by 443eb9#C."
}

export default async function Page() {
	return (
		<main className="">
			<div className="absolute top-[10%] md:top-1/4 left-[10%]">
				<div className="font-bender">
					<h1 className="text-4xl md:text-5xl">Welcome To:</h1>
					<h1 className="text-4xl md:text-7xl font-extrabold">Crepuscular</h1>
					<h1 className="text-4xl md:text-7xl font-extrabold">Archipelago</h1>
					<p className="md:leading-loose text-xl md:text-2xl">
						Islands that owned by 443eb9#C.
					</p>
				</div>
				<div className="font-bender">Background under construction...</div>
			</div>
			<div className="absolute bottom-[15%] md:top-1/4 right-[10%] text-right">
				<div>
					<h1 className="text-4xl md:text-5xl font-sh-serif md:leading-normal">欢迎来到</h1>
					<h1 className="text-4xl md:text-7xl font-extrabold">晨暮群岛</h1>
					<p className="md:leading-loose text-xl md:text-2xl">
						443eb9#C 的岛屿群
					</p>
				</div>
			</div>
			<div className="absolute left-[10%] bottom-1/4">
			</div>
		</main>
	)
}
