import type { Metadata } from "next";
import type { ReactNode } from "react";

/*== 样式重置 ==*/
import "modern-css-reset/dist/reset.min.css";

export const metadata: Metadata = {
  title: "Zhijian Home",
  description: "Zhijian migration workspace",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
