import { fetchSteamPlayerSummaries, fetchSteamRecentlyPlayedGames } from "@/data/api"
import NetworkErrorable from "../common/network-error-fallback"
import EmphasizedBox from "../common/decos/emphasized-box"
import Link from "next/link"

export default async function SteamInfo() {
    const recentlyPlayed = await fetchSteamRecentlyPlayedGames()
    const summary = await fetchSteamPlayerSummaries()
    let state: string, color: string, lastLogoff: Date
    if (summary.ok) {
        const player = summary.data.response.players[0]
        lastLogoff = new Date(player.lastlogoff * 1000)
        switch (player.personastate) {
            case 0:
                state = "Offline"
                color = "grey"
                break
            case 1:
                state = "Online"
                color = "greenyellow"
                break
            case 2:
                state = "Busy"
                color = "red"
                break
            case 3:
                state = "Away"
                color = "yellow"
                break
            default:
                return <></>
        }
    }

    return (
        <div className="mt-4">
            <NetworkErrorable resp={recentlyPlayed}>
                {data =>
                    <div className="flex flex-col gap-2 font-bender">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {
                                data.response.games.map((game, i) =>
                                    <div key={i}>
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
                                                    <h2>{Math.round(game.playtime_forever / 60 * 10) / 10} Hours</h2>
                                                </div>
                                            </EmphasizedBox>
                                        </Link>
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex flex-col text-lg font-bold italic">
                            <div className="flex gap-2">
                                <h1>Current State :</h1>
                                <div style={{ color: color }}>{state}</div>
                            </div>
                            <div className="flex gap-2">
                                <h1>Last Logoff :</h1>
                                <div className="">{lastLogoff?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                }
            </NetworkErrorable>
        </div>
    )
}
