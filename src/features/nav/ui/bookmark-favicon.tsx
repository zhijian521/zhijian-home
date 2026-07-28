/*============================================================================
  bookmark-favicon - 书签站点图标

  使用当前临时 favicon 服务，并在加载失败时降级为书签首字。
============================================================================*/

"use client";

import { useState } from "react";

import styles from "./bookmark-favicon.module.css";

function getDomain(url: string): string | null {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

interface BookmarkFaviconProps {
    fallback: string;
    url: string;
}

/*== 未接入 favicon 服务端代理前，使用 Google favicon 并在失败时回退到书签首字 ==*/
export function BookmarkFavicon({ fallback, url }: BookmarkFaviconProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const domain = getDomain(url);

    if (!domain || failedUrl === url) {
        return (
            <span aria-hidden="true" className={styles.fallback}>
                {fallback}
            </span>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element -- 外部 favicon 尺寸与域名均由用户书签决定
        <img
            alt=""
            className={styles.image}
            loading="lazy"
            onError={() => setFailedUrl(url)}
            referrerPolicy="no-referrer"
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
        />
    );
}
