import { Bookmarks } from "./model";

export const BookmarksMock: Bookmarks[] = [
    {
        category: "好看的Shader",
        content: [
            {
                title: "Production Sky Rendering",
                link: "https://www.shadertoy.com/view/Ms2SD1",
                comment: "大气散射"
            },
            {
                title: "Seascape",
                link: "https://www.shadertoy.com/view/slSXRW",
                comment: "海洋"
            }
        ]
    },
    {
        category: "牛逼的论文",
        content: [
            {
                title: "Massively Parallel A* Search on a GPU",
                link: "https://yichaozhou.com/publication/1501massive/",
                comment: "并行A*算法，快就完了"
            },
            {
                title: "Real-Time Polygonal-Light Shading with Linearly Transformed Cosines",
                link: "https://eheitzresearch.wordpress.com/415-2/",
                comment: "LTC，难死了（"
            }
        ]
    }
];