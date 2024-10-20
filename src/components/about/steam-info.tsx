import { fetchSteamInfo } from "@/data/api";
import { ErrorResponse } from "@/data/requests";
import NetworkErrorFallback from "../common/network-error-fallback";
import EmphasizedBox from "../common/decos/emphasized-box";
import Link from "next/link";

export default async function SteamInfo() {
    const info = await fetchSteamInfo();

    return (
        <div className="mt-4">
            {
                info instanceof ErrorResponse
                    ? <NetworkErrorFallback error={info}></NetworkErrorFallback>
                    : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {
                            info.data.response.games.map((game, i) =>
                                <div key={i} className="font-bender">
                                    <Link href={`https://store.steampowered.com/app/${game.appid}`} target="_blank">
                                        <EmphasizedBox
                                            className="flex justify-between items-center gap-2 p-2"
                                            thickness={3}
                                            length={10}
                                        >
                                            <div className="flex items-center gap-2">
                                                <img src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} alt="" />
                                                <h1 className="font-bold text-xl">{game.name}</h1>
                                            </div>
                                            <div className="">
                                                <h2>{game.playtime_forever / 60} Hours</h2>
                                            </div>
                                        </EmphasizedBox>
                                    </Link>
                                </div>
                            )
                        }
                    </div>
            }
        </div>
    );
}
