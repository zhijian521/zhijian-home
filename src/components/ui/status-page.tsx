/*============================================================================
  status-page - 页面状态页

  统一页面级不可用状态的容器结构，背景与内容宽度由路由页面传入。
============================================================================*/

import type { ReactNode } from "react";

import { StatusSection } from "./status-section";

interface StatusPageProps {
    align?: "start" | "center";
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
    description: string;
    title: string;
}

export function StatusPage({ align, children, className, contentClassName, description, title }: StatusPageProps) {
    return (
        <main className={className}>
            <div className={contentClassName}>
                <StatusSection align={align} description={description} title={title} titleAs="h1">
                    {children}
                </StatusSection>
            </div>
        </main>
    );
}
