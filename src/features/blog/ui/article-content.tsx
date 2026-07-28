/* eslint-disable @next/next/no-img-element -- 封面地址已由服务端限制为站内路径或 HTTPS，后台预览也需要复用同一输出。 */

/*== 公开详情页与后台预览共用封面和正文 ==*/

import type { ReactNode } from "react";

import { MarkdownArticle } from "./markdown-article";
import styles from "./article-content.module.css";

interface ArticleContentProps {
    altText: string;
    content: string;
    coverImage: string | null;
    header?: ReactNode;
}

export function ArticleContent({ altText, content, coverImage, header }: ArticleContentProps) {
    return (
        <div className={styles.root}>
            {coverImage ? (
                <figure className={styles.cover}>
                    <img alt={altText} fetchPriority="high" src={coverImage} />
                </figure>
            ) : null}

            {header}

            {content ? <MarkdownArticle content={content} /> : <p className={styles.empty}>暂无正文。</p>}
        </div>
    );
}
