"use client"

import AnimEnterBlink from "@/components/anim/anim-enter-blink";
import ContentWrapper from "@/components/content-wrapper";
import Footer from "@/components/footer";
import GiscusSection from "@/components/giscus-section";
import Markdown from "@/components/markdown";
import NavBar from "@/components/nav-bar";
import { NetworkFailableSync } from "@/components/network-failable";
import OutlinedBox from "@/components/outlined-box";
import OutlinedButton from "@/components/outlined-button";
import AsciiText from "@/components/text/ascii-text";
import BodyText from "@/components/text/body-text";
import TitleText from "@/components/text/title-text";
import { Response } from "@/data/api";
import { GithubRepoStat, ProjectData, SelfTitleData } from "@/data/model";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";
import * as motion from "motion/react-client";
import { findClassNameAmong, isScrolledToBottom, isScrolledToTop } from "@/data/utils";
import GitHubCalendar from 'react-github-calendar';
import { useTheme } from "next-themes";
import { RiBilibiliLine } from "react-icons/ri";
import SvgDeco from "@/components/svg-deco/svg-deco";
import { frontendEndpoint } from "@/data/endpoints";

const preventPageSwitch = "prevent-page-switch"

export default function AboutClientPageWrapper({
    selfIntro, projects, projectGhStats, titles, emoticons
}: {
    selfIntro: Response<string>, projects: Response<ProjectData[]>, projectGhStats?: Response<GithubRepoStat>[], titles: Response<SelfTitleData[]>, emoticons: Response<string[]>
}) {
    function MobilePage() {
        return (
            <>
                <NavBar />
                <div className="flex flex-col gap-8 mx-2 pt-20">
                    <SelfIntro text={selfIntro} titles={titles} emoticons={emoticons} />
                    <Projects projects={projects} projectGhStats={projectGhStats} />
                    <GiscusSection />
                </div>
            </>
        )
    }

    function DesktopPage() {
        const [page, setPage] = useState(0)
        const [navBar, setNavBar] = useState(true)

        const pages = [
            <SelfIntro key={0} text={selfIntro} titles={titles} emoticons={emoticons} />,
            <Projects key={1} projects={projects} projectGhStats={projectGhStats} />,
        ]

        useEffect(() => {
            const scrollHandler = (ev: WheelEvent) => {
                const prevent = findClassNameAmong(ev.target as HTMLElement, preventPageSwitch)

                if (window.scrollY > 0) return

                const offset = ev.deltaY > 0 ? 1 : -1
                if (prevent) {
                    if (offset == 1 && !isScrolledToBottom(prevent)) return
                    if (offset == -1 && !isScrolledToTop(prevent)) return
                }

                const newPage = page + offset

                if (navBar && offset == 1) {
                    setNavBar(false)
                    return
                }

                if (newPage == -1) {
                    setNavBar(true)
                    return
                }

                if (newPage >= 0 && newPage < pages.length) {
                    setPage(newPage)
                }
            }

            if (window.innerWidth > 768) {
                window.addEventListener("wheel", scrollHandler)
            }

            return () => {
                window.removeEventListener("wheel", scrollHandler)
            }
        }, [page, navBar])

        const currentPage = useMemo(() => pages[page], [page])

        return (
            <>
                <AnimatePresence>
                    {
                        navBar &&
                        <motion.div
                            initial={{ top: "-48px" }}
                            animate={{ top: "0", transition: { duration: 0.2, ease: "easeOut" } }}
                            exit={{ top: "-48px", transition: { duration: 0.2, ease: "easeOut" } }}
                            className="absolute"
                        >
                            <NavBar />
                        </motion.div>
                    }
                </AnimatePresence>
                <div>
                    <div className="flex w-[100vw] h-[100vh] items-center justify-center">
                        <div className="w-[80%] h-[80%] max-w-[1280px] max-h-[720px]">
                            {currentPage}
                        </div>
                    </div>
                    {
                        page == pages.length - 1 &&
                        <>
                            <ContentWrapper>
                                <GiscusSection className="w-full" />
                            </ContentWrapper>
                            <Footer />
                        </>
                    }
                </div>
            </>
        )
    }

    const [node, setNode] = useState<ReactNode | null>(null)

    useEffect(() => {
        const handleResize = () => {
            setNode(window.innerWidth > 768 ? <DesktopPage /> : <MobilePage />)
        }
        handleResize()

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return node
}

function Title({ title }: { title: string }) {
    return (
        <AsciiText className="absolute h-4 -top-4 pl-2 pr-4 text-[8pt] font-bold bg-dark-0 dark:bg-light-0" inv>{title}</AsciiText>
    )
}

function SelfIntro({ text, titles, emoticons }: { text: Response<string>, titles: Response<SelfTitleData[]>, emoticons: Response<string[]> }) {
    function SocialMediaButton({ children, href }: { children: React.ReactNode, href: string }) {
        return (
            <Link href={href}>
                <OutlinedButton className="flex justify-center items-center w-8 aspect-square">
                    {children}
                </OutlinedButton>
            </Link>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-2 w-full h-full">
            <AnimEnterBlink className="relative flex flex-col gap-2" >
                <Title title="INFORMATION" />
                <OutlinedBox className="flex p-4">
                    <div className="w-full h-full">
                        <OutlinedBox className="w-full aspect-square bg-cover" style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/50186452)" }}></OutlinedBox>
                        <div className="flex flex-col gap-1 mt-2">
                            <AsciiText className="font-bold text-4xl">443eb9#C</AsciiText>
                            <TitleText className="text-lg">中国 浙江</TitleText>
                            <div className="flex gap-2 items-center text-xl">
                                <IoMailOutline className="text-dark-0 dark:text-light-0" />
                                <AsciiText>443eb9@gmail.com</AsciiText>
                            </div>
                            <div className="">
                                <NetworkFailableSync response={titles}>
                                    {data => data.map((title, i) =>
                                        <div key={i} className="relative flex gap-1 text-sm bg-dark-0 dark:bg-light-0">
                                            <AnimatePresence>
                                                <motion.div
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: `${title.progress * 100}%`, transition: { duration: 0.2, ease: "easeOut" } }}
                                                    className="absolute h-full w-full bg-accent-0"
                                                />
                                            </AnimatePresence>
                                            <div className="flex gap-1 px-1 z-[1]">
                                                <AsciiText inv style={{ opacity: 1 - title.progress }}>Future</AsciiText>
                                                <AsciiText inv>{title.title}</AsciiText>
                                            </div>
                                        </div>
                                    )}
                                </NetworkFailableSync>
                            </div>
                            <div className="flex mt-2 gap-2 flex-wrap">
                                <SocialMediaButton href="https://github.com/443eb9"><FiGithub className="text-lg text-dark-0 dark:text-light-0" /></SocialMediaButton>
                                <SocialMediaButton href="https://space.bilibili.com/401786213"><RiBilibiliLine className="text-lg text-dark-0 dark:text-light-0" /></SocialMediaButton>
                                <SocialMediaButton href="https://www.artstation.com/sharpc443eb96"><SvgDeco url={frontendEndpoint("/images/platform/ArtStation-logomark-white.svg")} className="w-full h-full" /></SocialMediaButton>
                                <SocialMediaButton href="https://x.com/443eb9"><SvgDeco url={frontendEndpoint("/images/platform/X_Logo.svg")} className="w-3/5 h-3/5" /></SocialMediaButton>
                            </div>
                            <div className="flex grow items-center">
                                <NetworkFailableSync response={emoticons}>
                                    {
                                        data => <AsciiText className="opacity-50 font-bold">
                                            {data[Math.floor(Math.random() * data.length)]}
                                        </AsciiText>
                                    }
                                </NetworkFailableSync>
                            </div>
                        </div>
                    </div>
                </OutlinedBox>
                <OutlinedBox className="font-sh-sans opacity-50 italic text-large p-2 border-dashed">
                    <BodyText>期待这边多出来一个 米画师 图标的一天</BodyText>
                    <BodyText className="text-right">——2024.8.15留</BodyText>
                </OutlinedBox>
            </AnimEnterBlink>
            <AnimEnterBlink className="relative w-full h-full" >
                <Title title="SELF INTRODUCTION" />
                <OutlinedBox className={`md:w-full h-full p-2 md:p-4 md:overflow-scroll ${preventPageSwitch}`}>
                    <NetworkFailableSync response={text}>
                        {data => <Markdown body={data} />}
                    </NetworkFailableSync>
                </OutlinedBox>
            </AnimEnterBlink>
        </div>
    )
}


function Projects({ projects, projectGhStats }: { projects: Response<ProjectData[]>, projectGhStats: Response<GithubRepoStat>[] | undefined }) {
    const { resolvedTheme } = useTheme()

    return (
        <div className="flex flex-col h-full gap-8">
            <NetworkFailableSync response={projects}>
                {
                    data =>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-8 mt-4 overflow-y-scroll pt-4  ${preventPageSwitch}`}>
                            {
                                data.map((project, i) => {
                                    if (!projectGhStats) {
                                        return null
                                    }

                                    return (
                                        <AnimEnterBlink key={i} className="relative flex">
                                            <Title title={`SHOWCASE PROJECT #${i}`} />
                                            <OutlinedBox className="flex-grow">
                                                <div className="flex justify-between items-center m-2">
                                                    <div>
                                                        <AsciiText className="text-2xl font-bold" >
                                                            <Link target="_blank" href={`https://github.com/${project.owner}/${project.name}`}>{project.name}</Link>
                                                        </AsciiText>
                                                        {
                                                            project.isPublic
                                                                ? <NetworkFailableSync response={projectGhStats[i]}>
                                                                    {
                                                                        data =>
                                                                            <div>
                                                                                <AsciiText>Language: {data.language}</AsciiText>
                                                                                <AsciiText>{data.stargazers_count} Star(s)</AsciiText>
                                                                                <div className="flex gap-5">
                                                                                    <AsciiText className="">
                                                                                        Created at {new Date(data.created_at).toLocaleDateString()}
                                                                                    </AsciiText>
                                                                                    <AsciiText className="">
                                                                                        Updated at {new Date(data.updated_at).toLocaleDateString()}
                                                                                    </AsciiText>
                                                                                </div>
                                                                            </div>
                                                                    }
                                                                </NetworkFailableSync>
                                                                : <AsciiText>Private Project</AsciiText>
                                                        }
                                                    </div>
                                                    <AsciiText className="opacity-50 text-3xl font-bold italic mr-2">{project.owner}</AsciiText>
                                                </div>
                                            </OutlinedBox>
                                        </AnimEnterBlink>
                                    )
                                })
                            }
                        </div>
                }
            </NetworkFailableSync>
            <div className="relative h-52">
                <Title title="GITHUB CONTRIBUTIONS" />
                <OutlinedBox className="flex justify-center items-center h-full">
                    <GitHubCalendar
                        username="443eb9"
                        colorScheme={resolvedTheme == "light" ? "dark" : "light"}
                        style={{ color: resolvedTheme == "light" ? "#f5f5f5" : "#171717" }}
                    />
                </OutlinedBox>
            </div>
        </div>
    )
}
