import { fetchGithubProjectStat, fetchProjectList } from "@/data/api"
import EmphasizedBox from "../common/decos/emphasized-box"
import NetworkErrorable from "../common/network-error-fallback"

export default async function Projects() {
    const projects = await fetchProjectList()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <NetworkErrorable resp={projects}>
                {data =>
                    data.map(async (project, i) => {
                        const response = await fetchGithubProjectStat(project.owner, project.name)

                        return (
                            <EmphasizedBox thickness={3} length={15} key={i} className="font-bender p-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <a className="text-2xl font-bold" target="_blank" href={`https://github.com/${project.owner}/${project.name}`}>{project.name}</a>
                                        <NetworkErrorable resp={response}>
                                            {data =>
                                                <div>
                                                    <h3>Language: {data.language}</h3>
                                                    <h3>{data.stargazers_count} Star(s)</h3>
                                                    <div className="flex gap-5">
                                                        <div className="">
                                                            Created at {new Date(data.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="">
                                                            Updated at {new Date(data.updated_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </NetworkErrorable>
                                    </div>
                                    <div className="text-light-dark-neutral text-3xl font-bold italic mr-2">{project.owner}</div>
                                </div>
                            </EmphasizedBox>
                        )
                    })
                }
            </NetworkErrorable>
        </div>
    )
}
