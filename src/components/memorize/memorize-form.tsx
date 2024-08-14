'use client';

import React, { FormEvent } from "react";
import InputBox from "../common/input-box";
import OutlinedBox from "../common/outlined-box";
import OutlinedButton from "../common/outlined-button";
import { submitMemorize } from "@/data/memorize";
import toast from "react-hot-toast";
import Toast from "../common/toast";
import { combineRemoteApi } from "@/data/backend";

export default function MemorizeForm() {
    return (
        <div className="flex flex-col gap-4">
            <form className="flex flex-col gap-8" onSubmit={onSubmit}>
                <FormSection title="我是" whisper="歪比巴卜">
                    <FormRow>
                        <FormUnit title="八位学号" name="stu_id"></FormUnit>
                        <FormUnit title="姓名" name="name"></FormUnit>
                    </FormRow>
                </FormSection>
                <FormSection title="联系方式" whisper="至少填一个 总有一款适合你">
                    <FormRow>
                        <FormUnit title="微信" name="wechat" optional></FormUnit>
                        <FormUnit title="QQ" name="qq" optional></FormUnit>
                    </FormRow>
                    <FormRow>
                        <FormUnit title="电话" name="phone" optional></FormUnit>
                        <FormUnit title="邮箱" name="email" optional></FormUnit>
                    </FormRow>
                </FormSection>
                <FormSection title="印象" whisper="歪比歪比(?)">
                    <FormRow>
                        <FormUnit title="一个词描述自己" name="desc" optional></FormUnit>
                        <FormUnit title="爱好" name="hobby" optional></FormUnit>
                    </FormRow>
                    <FormRow>
                        <FormUnit title="职位" name="position" optional></FormUnit>
                        <FormUnit title="未来专业(or计划)" name="ftr_major" optional></FormUnit>
                    </FormRow>
                </FormSection>
                <FormSection title="留言" whisper="你甚至可以用留言板和别人聊天(?)">
                    <OutlinedBox className="p-2 h-48">
                        <textarea className="w-full h-full bg-transparent outline-none resize-none placeholder:font-bender" name="message" placeholder="Optional"></textarea>
                    </OutlinedBox>
                </FormSection>
                <div className="flex justify-center">
                    <OutlinedButton type="submit" className="w-1/2 h-20 text-4xl font-sh-serif font-bold">
                        提交
                    </OutlinedButton>
                </div>
            </form>
            <div className="italic font-sh-sans">
                只要这个网站依然可以正常访问，你就可以在这里下载到你和其他同学填写的表格。此外，我也会在钉钉群内发一份表格。
            </div>
            <div className="flex flex-wrap gap-y-2 justify-around">
                <OutlinedButton className="p-4 w-full max-w-72 text-2xl font-sh-serif font-bold">
                    <a href={combineRemoteApi("/get/memorizeDb")}>下载Sqlite3数据库文件</a>
                </OutlinedButton>
                <OutlinedButton className="p-4 w-full max-w-72 text-2xl font-sh-serif font-bold">
                    <a href={combineRemoteApi("/get/memorizeCsv")}>生成.csv表格并下载</a>
                </OutlinedButton>
            </div>
        </div>
    );
}

function FormUnit({ title, optional, name }: { title: string, optional?: boolean, name?: string }) {
    return (
        <div className="max-w-64 w-full">
            <div className="text-lg">{title}</div>
            <div className="h-10">
                <InputBox placeholder={optional ? "Optional" : ""} name={name}></InputBox>
            </div>
        </div>
    );
}

function FormRow({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={`flex flex-row gap-2 justify-around ${className}`}>
            {children}
        </div>
    );
}

function FormSection({ className, title, children, whisper }: { className?: string, title: string, whisper?: string, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-5 items-baseline">
                <div className="font-sh-serif font-bold text-2xl">{title}</div>
                <div className="font-sh-serif font-bold italic text-sm text-dark-contrast0">{whisper}</div>
            </div>
            <div className={`flex flex-col gap-y-2 w-full ${className}`}>
                {children}
            </div>
        </div>
    );
}

async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    submitMemorize(formData)
        .catch((reason) => {
            const data = reason["response"]["data"];
            toast.custom(<Toast title="Error" toast={data == undefined ? reason.toString() : data}></Toast>)
        })
        .then((value) => {
            if (value == null) {
                return;
            }

            toast.custom(<Toast title="Success!" toast={value.data}></Toast>)
        });
}
