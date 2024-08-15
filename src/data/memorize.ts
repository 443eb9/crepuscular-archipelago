import axios from "axios";
import { combineRemoteApi } from "./backend";
import { MemorizeForm } from "./model";

export async function submitMemorize(form: FormData) {
    const payload: MemorizeForm = {
        stu_id: (form.get("stu_id") ?? "").toString(),
        name: (form.get("name") ?? "").toString(),

        wechat: (form.get("wechat") ?? "").toString(),
        qq: (form.get("qq") ?? "").toString(),
        phone: (form.get("phone") ?? "").toString(),
        email: (form.get("email") ?? "").toString(),

        desc: (form.get("desc") ?? "").toString(),
        hobby: (form.get("hobby") ?? "").toString(),
        position: (form.get("position") ?? "").toString(),
        ftr_major: (form.get("ftr_major") ?? "").toString(),

        message: (form.get("message") ?? "").toString(),
        ip: (await axios.get("https://api.ipify.org?format=json")).data["ip"],
    };

    return axios.post(combineRemoteApi("/post/memorize"), payload);
}

export async function downloadMemorizeDb() {
    (await axios.get(combineRemoteApi("/get/memorizeDb"), { responseType: "blob" }));
}

export async function downloadMemorizeCsv() {
    (await axios.get(combineRemoteApi("/get/memorizeCsv"), { responseType: "stream" }));
}
