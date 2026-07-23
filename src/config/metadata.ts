/*============================================================================
  metadata - 站点元数据

  提供根布局使用的标题、描述与站点图标配置。
============================================================================*/

import type { Metadata } from "next";

export const ROOT_METADATA = {
    title: "Zhijian Home",
    description: "Zhijian migration workspace",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
            {
                url: "/images/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png",
            },
            {
                url: "/images/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/images/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
} satisfies Metadata;
