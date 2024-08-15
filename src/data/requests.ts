import axios, { AxiosError, AxiosResponse } from "axios";
import { ErrorResponse } from "./island";

const axiosInstance = axios.create();

export async function get(url: string) {
    return await axiosInstance.get(url).catch((reason: AxiosError) => {
        return new ErrorResponse(reason.response)
    });
}
