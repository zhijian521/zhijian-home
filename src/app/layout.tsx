import type { Metadata } from "next";

import { ROOT_METADATA } from "@/config/metadata";
import type { RootLayoutProps } from "@/types/app";

/*== 样式重置 ==*/
import "modern-css-reset/dist/reset.min.css";

/*== 设计系统 ==*/
import "@/styles/tokens.css";
import "@/styles/theme.css";
import "@/styles/globals.css";

export const metadata: Metadata = ROOT_METADATA;

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}
