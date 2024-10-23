import axios, { AxiosError, AxiosResponse } from "axios";

export class ErrorResponse {
    error: undefined | AxiosResponse<any, any>

    constructor(error: undefined | AxiosResponse<any, any>) {
        this.error = error
    }
}

export type Response<T> = ErrorResponse | AxiosResponse<T, any>;

const axiosInstance = axios.create();

export async function get(url: string) {
    return await axiosInstance.get(url).catch((reason: AxiosError) => {
        return new ErrorResponse(reason.response)
    });
}
