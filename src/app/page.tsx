import { Metadata } from 'next'
import NavButtons from './(pages)/nav-buttons'

export const metadata: Metadata = {
	title: "443eb9#C - Crepuscular Archipelago",
	description: "443eb9#C's blog - Islands that owned by 443eb9#C."
}

export default async function Page() {
	return (
		<main className="w-full h-full">
			<div className="absolute top-[10%] md:top-[20%] left-[10%] font-bender">
				<h1 className="text-4xl md:text-5xl">Welcome To:</h1>
				<h1 className="text-4xl md:text-7xl font-extrabold">Crepuscular</h1>
				<h1 className="text-4xl md:text-7xl font-extrabold">Archipelago</h1>
				<p className="md:leading-loose text-xl md:text-2xl">
					Islands that owned by 443eb9#C.
				</p>
			</div>
			<div className="absolute bottom-[15%] md:top-[20%] right-[10%] text-right">
				<div>
					<h1 className="text-4xl md:text-5xl font-sh-serif md:leading-normal">欢迎来到</h1>
					<h1 className="text-4xl md:text-7xl font-extrabold">晨暮群岛</h1>
					<p className="md:leading-loose text-xl md:text-2xl">
						443eb9#C 的岛屿群
					</p>
				</div>
			</div>
			<div className="absolute w-[100%] h-[40%] md:w-[80%] md:h-auto left-[10%] bottom-[20%] flex md:justify-center">
				<div className="flex flex-col md:flex-row gap-4 md:gap-10 flex-wrap flex-shrink">
					<NavButtons className="w-20 h-10 md:w-40 md:h-20 text-lg md:text-3xl" />
				</div>
			</div>
		</main>
	)
}
