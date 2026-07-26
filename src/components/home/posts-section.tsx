/*============================================================================
  posts-section - 首页最新文章区

  展示服务端提供的三篇最新文章；无数据时直接呈现空状态。
============================================================================*/

import { PostCard } from "@/components/home/post-card";
import { SectionHeading } from "@/components/site/section-heading";
import { TextButton } from "@/components/ui/text-button";
import type { PostPreview } from "@/types/post";

import styles from "./posts-section.module.css";

interface PostsSectionProps {
    posts: PostPreview[];
}

export function PostsSection({ posts }: PostsSectionProps) {
    return (
        <section aria-labelledby="posts-title" className={styles.section} id="posts">
            <div className={styles.container}>
                <SectionHeading
                    action={
                        <TextButton href="/blog" icon="arrow-right">
                            查看全部
                        </TextButton>
                    }
                    id="posts-title"
                >
                    最新文章
                </SectionHeading>

                {posts.length > 0 ? (
                    <div className={styles.grid}>
                        {posts.map((post) => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>暂无文章。</p>
                )}
            </div>
        </section>
    );
}
