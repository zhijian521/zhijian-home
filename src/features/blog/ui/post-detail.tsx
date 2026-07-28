/*== 组合文章标题、元信息和共享正文展示 ==*/

import { Breadcrumb } from "@/components/site/breadcrumb";
import { Tag } from "@/components/ui/tag";
import { formatPostDate, toPostIsoDateTime } from "@/lib/core/date";
import type { PublishedPostDetail } from "@/types/post";

import { ArticleContent } from "./article-content";
import styles from "./post-detail.module.css";

interface PostDetailProps {
    post: PublishedPostDetail;
}

export function PostDetail({ post }: PostDetailProps) {
    const publishedDate = formatPostDate(post.publishedAt);
    const updatedDate = post.updatedAt === post.publishedAt ? null : formatPostDate(post.updatedAt);
    const publishedDateTime = toPostIsoDateTime(post.publishedAt);
    const updatedDateTime = toPostIsoDateTime(post.updatedAt);

    return (
        <article className={styles.article}>
            <Breadcrumb
                items={[
                    { href: "/", label: "首页" },
                    { href: "/blog", label: "文章" },
                    { label: post.title },
                ]}
            />

            <ArticleContent
                altText={post.altText ?? post.title}
                content={post.content}
                coverImage={post.coverImage}
                header={
                    <header className={styles.header}>
                        <h1 className={styles.title}>{post.title}</h1>

                        {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}

                        <div className={styles.meta}>
                            {post.categoryName ? <Tag variant="primary">{post.categoryName}</Tag> : null}

                            {post.tags.map((tag) => (
                                <Tag key={tag.slug}>{tag.name}</Tag>
                            ))}

                            {publishedDate ? (
                                <time dateTime={publishedDateTime}>发布于 {publishedDate}</time>
                            ) : null}

                            {updatedDate ? <time dateTime={updatedDateTime}>更新于 {updatedDate}</time> : null}
                        </div>
                    </header>
                }
            />
        </article>
    );
}
