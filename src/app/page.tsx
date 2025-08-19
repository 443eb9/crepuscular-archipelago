import { NetworkFailableSync } from "@/components/network-failable";
import { wrappedFetch } from "@/data/api";
import { frontendEndpoint } from "@/data/endpoints";
import { SelfTitleData } from "@/data/model";
import MotionTitles from "./motion-titles";
import TitleText from "@/components/text/title-text";
import AsciiText from "@/components/text/ascii-text";
import OutlinedBox from "@/components/outlined-box";
import BodyText from "@/components/text/body-text";
import NavBarButtons from "@/components/nav-bar-buttons";

export default async function Home() {
	const titles = await wrappedFetch<SelfTitleData[]>(frontendEndpoint("/self-titles.json"), "GET")
	const chickenSoups = await wrappedFetch<string[]>(frontendEndpoint("/chicken-soups.json"), "GET")

	return (
		<>
			<div className="w-[100vw] h-[100vh] flex justify-center items-center">
				{/* PC */}
				<div className="w-4/5 h-4/5 max-w-[1280px] max-h-[720px] hidden md:block">
					<div className="w-full h-1/2 flex">
						<div className="w-1/2 flex flex-col">
							<OutlinedBox className="w-24 aspect-square bg-cover" style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/50186452)" }}></OutlinedBox>
							<AsciiText className="text-[30pt] font-bold">I'm 443eb9#C, a</AsciiText>
							<div className="flex flex-col text-[40pt]">
								<NetworkFailableSync response={titles}>
									{titles => <MotionTitles titles={titles} />}
								</NetworkFailableSync>
							</div>
						</div>
						<div className="w-1/2 flex items-end flex-col">
							<TitleText className="text-[60pt]">晨暮群岛</TitleText>
							<AsciiText className="text-[40pt] text-nowrap">Crepuscular Archipelago</AsciiText>
							<NetworkFailableSync response={chickenSoups}>
								{soups =>
									<BodyText className="max-w-[70%]">
										{soups[Math.floor(Math.random() * soups.length)]}
									</BodyText>
								}
							</NetworkFailableSync>
						</div>
					</div>
					<div className="w-full h-1/2 flex items-end">
						<div className="w-1/2 h-full"></div>
						<div className="w-1/2 h-full flex justify-end">
							<div className="flex -scale-y-100 text-2xl gap-4">
								<NavBarButtons flipped width={120} height={60} />
							</div>
						</div>
					</div>
				</div>

				{/* Mobile */}
				<div className="w-[calc(100%-30px)] h-[calc(100%-30px)] max-w-[1280px] max-h-[720px] md:hidden flex flex-col justify-between">
					<div className="w-full flex flex-col gap-8">
						<div className="flex flex-col items-end">
							<TitleText className="text-[20pt]">晨暮群岛</TitleText>
							<AsciiText className="text-[20pt] text-nowrap">Crepuscular Archipelago</AsciiText>
							<NetworkFailableSync response={chickenSoups}>
								{soups =>
									<BodyText className="max-w-[70%] text-[10pt]">
										{soups[Math.floor(Math.random() * soups.length)]}
									</BodyText>
								}
							</NetworkFailableSync>
						</div>
						<div className="flex flex-col">
							<OutlinedBox className="w-24 aspect-square bg-cover" style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/50186452)" }}></OutlinedBox>
							<AsciiText className="text-[20pt] font-bold">I'm 443eb9#C, a</AsciiText>
							<div className="flex flex-col text-[20pt]">
								<NetworkFailableSync response={titles}>
									{titles => <MotionTitles titles={titles} />}
								</NetworkFailableSync>
							</div>
						</div>
					</div>
					<div className="w-full flex items-end">
						<div className="h-full"></div>
						<div className="h-full flex justify-end">
							<div className="flex -scale-y-100 gap-4">
								<NavBarButtons flipped width={80} height={40} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
