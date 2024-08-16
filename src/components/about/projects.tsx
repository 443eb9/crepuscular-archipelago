import { fetchProjectList } from "@/data/api";
import EmphasizedBox from "../common/decos/emphasized-box";
import { ErrorResponse, get } from "@/data/requests";
import NetworkErrorFallback from "../common/network-error-fallback";

export default async function Projects() {
    const projects = await fetchProjectList();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            {
                projects instanceof ErrorResponse
                    ? <NetworkErrorFallback error={projects}></NetworkErrorFallback>
                    : projects.data.map(async (project, i) => {
                        const response = await get(`https://api.github.com/repos/${project.owner}/${project.name}`);

                        return (
                            <EmphasizedBox thickness={3} length={15} key={i} className="font-bender p-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <a className="text-2xl font-bold" target="_blank" href={`https://github.com/${project.owner}/${project.name}`}>{project.name}</a>
                                        {
                                            response instanceof ErrorResponse
                                                ? <div className="">Rate limit exceeded, please try again later. :(</div>
                                                : <div>
                                                    <h3>Language: {response.data.language}</h3>
                                                    <h3>{response.data.stargazers_count} Star(s)</h3>
                                                    <div className="flex gap-5">
                                                        <div className="">
                                                            Created at {new Date(response.data.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="">
                                                            Updated at {new Date(response.data.updated_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                    <div className="text-light-dark-neutral text-3xl font-bold italic mr-2">{project.owner}</div>
                                </div>
                            </EmphasizedBox>
                        );
                    })
            }
        </div>
    );
}
