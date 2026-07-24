/*============================================================================
  use-scroll-threshold - 页面滚动阈值状态

  统一管理全局滚动监听的初始化与清理，避免使用方重复处理生命周期。
============================================================================*/

"use client";

import { useEffect, useState } from "react";

/**
 * 判断页面垂直滚动位置是否超过指定阈值。
 * @param threshold - 触发状态变化的垂直滚动距离，单位为 CSS 像素
 */
export function useScrollThreshold(threshold: number): boolean {
    const [isPastThreshold, setIsPastThreshold] = useState(false);

    useEffect(() => {
        const updateScrollState = () => setIsPastThreshold(window.scrollY > threshold);

        updateScrollState();
        window.addEventListener("scroll", updateScrollState, { passive: true });

        return () => window.removeEventListener("scroll", updateScrollState);
    }, [threshold]);

    return isPastThreshold;
}
