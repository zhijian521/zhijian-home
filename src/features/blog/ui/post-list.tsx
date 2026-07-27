/* eslint-disable @next/next/no-img-element -- 文章封面由数据库维护，来源在服务端限制为站内路径或 HTTPS。 */

/*============================================================================
  post-list - 博客文章列表

  沿用旧站的阅读列表结构：整行可点击，正文在左、可选封面在右。
============================================================================*/

import Link from "next/link";

import { formatPostDate } from "@/lib/core/date";
import type { PostPreview } from "@/types/post";

import styles from "./post-list.module.css";

interface PostListProps {
    posts: PostPreview[];
}

export function PostList({ posts }: PostListProps) {
    return (
        <ol aria-label="文章列表" className={styles.list}>
            {posts.map((post) => {
                /*== 列表按最近更新时间排序，展示日期也优先反映最近修订 ==*/
                const postDate = post.updatedAt ?? post.publishedAt;
                const formattedPostDate = formatPostDate(postDate);
                const coverImage = post.coverImage;

                return (
                    <li className={styles.item} key={post.slug}>
                        <article>
                            <Link className={styles.link} href={`/blog/${post.slug}`}>
                                <div className={styles.body}>
                                    <h2 className={styles.title}>{post.title}</h2>

                                    {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}

                                    <div className={styles.meta}>
                                        {post.categoryName ? <span className={styles.category}>{post.categoryName}</span> : null}
                                        {formattedPostDate ? (
                                            <time className={styles.date} dateTime={postDate?.slice(0, 10)}>
                                                {formattedPostDate}
                                            </time>
                                        ) : null}
                                    </div>
                                </div>

                                {coverImage ? (
                                    <div className={styles.cover}>
                                        <img alt={post.altText ?? post.title} loading="lazy" referrerPolicy="no-referrer" src={coverImage} />
                                    </div>
                                ) : null}
                            </Link>
                        </article>
                    </li>
                );
            })}
        </ol>
    );
}
