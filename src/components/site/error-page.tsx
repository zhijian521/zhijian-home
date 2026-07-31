/*============================================================================
  error-page - 站点错误页

  为路由渲染错误提供统一反馈与恢复操作。
============================================================================*/

"use client";

import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

import styles from "./status-screen.module.css";

interface ErrorPageProps {
    onRetry: () => void;
}

export function ErrorPage({ onRetry }: ErrorPageProps) {
    return (
        <StatusPage
            align="center"
            className={clsx(styles.page, styles.fullViewport)}
            contentClassName={styles.content}
            description="页面暂时无法加载，请稍后再试。"
            title="页面出现错误"
        >
            <div className={styles.actions}>
                <Button asButton onClick={onRetry} variant="primary">
                    重新加载
                </Button>
                <Button href="/">返回首页</Button>
            </div>
        </StatusPage>
    );
}
