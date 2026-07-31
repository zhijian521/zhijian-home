/*============================================================================
  error - 路由错误边界

  捕获根布局以下的未处理渲染错误，并交由统一错误页反馈与重试。
============================================================================*/

"use client";

import { ErrorPage } from "@/components/site/error-page";

interface RouteErrorProps {
    unstable_retry: () => void;
}

export default function RouteError({ unstable_retry }: RouteErrorProps) {
    return <ErrorPage onRetry={unstable_retry} />;
}
