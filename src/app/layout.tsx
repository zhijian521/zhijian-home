import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { ROOT_METADATA } from "@/config/metadata";

/*== 样式重置 ==*/
import "modern-css-reset/dist/reset.min.css";

/*== 设计系统 ==*/
import "@/styles/tokens.css";
import "@/styles/theme.css";
import "@/styles/globals.css";

export const metadata: Metadata = ROOT_METADATA;

/*== 项目入口布局 ==*/
export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html data-scroll-behavior="smooth" lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}
