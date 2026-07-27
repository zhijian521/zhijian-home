/* eslint-disable @next/next/no-img-element -- 文章封面由数据库维护，来源在服务端限制为站内路径或 HTTPS。 */

/*============================================================================
  post-card - 最新文章卡片

  整卡为一个文章详情链接，避免标题、操作提示等内容产生嵌套链接。
============================================================================*/

import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import { TextButton } from "@/components/ui/text-button";
import { formatPostDate } from "@/lib/core/date";
import type { PostPreview } from "@/types/post";

import styles from "./post-card.module.css";

interface PostCardProps {
    post: PostPreview;
}

export function PostCard({ post }: PostCardProps) {
    const postDate = post.updatedAt ?? post.publishedAt;
    const formattedPostDate = formatPostDate(postDate);
    const coverImage = post.coverImage;

    return (
        <article className={styles.card}>
            <Link className={styles.link} href={`/blog/${post.slug}`}>
                {coverImage ? (
                    <div className={styles.visualImage}>
                        <img alt={post.altText ?? post.title} loading="lazy" referrerPolicy="no-referrer" src={coverImage} />
                    </div>
                ) : null}

                <div className={styles.body}>
                    <h3 className={styles.title}>{post.title}</h3>

                    <div className={styles.meta}>
                        {post.categoryName ? (
                            <Tag className={styles.category} title={post.categoryName} variant="primary">
                                {post.categoryName}
                            </Tag>
                        ) : null}
                        {formattedPostDate ? (
                            <time className={styles.date} dateTime={postDate?.slice(0, 10)}>
                                {formattedPostDate}
                            </time>
                        ) : null}
                    </div>

                    {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}

                    <TextButton className={styles.readMore} icon="arrow-right">
                        阅读更多
                    </TextButton>
                </div>
            </Link>
        </article>
    );
}
