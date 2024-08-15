import { AboutProjects } from "@/data/about-projects";
import EmphasizedBox from "../common/decos/emphasized-box";
import { ErrorResponse } from "@/data/island";
import { get } from "@/data/requests";

export default function Projects() {
    return (
        <div className="grid md:grid-cols-2 gap-5 mt-4">
            {
                AboutProjects.map(async (project, i) => {
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
