import axios, { AxiosError } from "axios";

const axiosInstance = axios.create();

export async function get(url: string) {
    try {
        return await axiosInstance.get(url);
    } catch (error) {
        console.log(error);
        return (error as AxiosError<{ message: string }>).response?.data?.message ?? "";
    }
}
