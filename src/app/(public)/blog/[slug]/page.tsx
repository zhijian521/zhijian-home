/*== 路由层处理动态参数、页面状态和 metadata；详情读取集中在博客 feature ==*/

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildPostJsonLd, buildPostMetadata } from "@/features/blog/lib/detail-metadata";
import { getBlogPostDetailPageData } from "@/features/blog/lib/detail-page-data";

import { StatusPage } from "@/components/ui/status-page";
import { TextButton } from "@/components/ui/text-button";
import { PostDetail } from "@/features/blog/ui/post-detail";

import styles from "./page.module.css";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const pageData = await getBlogPostDetailPageData(slug);

    return buildPostMetadata(pageData.status === "available" ? pageData.post : null);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const pageData = await getBlogPostDetailPageData(slug);

    if (pageData.status === "not-found") {
        notFound();
    }

    if (pageData.status === "unavailable") {
        return (
            <StatusPage
                className={styles.page}
                contentClassName={styles.container}
                description="请稍后再试，或返回文章列表继续阅读。"
                title="文章暂时无法加载"
            >
                <TextButton href="/blog" icon="arrow-right">
                    返回文章列表
                </TextButton>
            </StatusPage>
        );
    }

    const postJsonLd = buildPostJsonLd(pageData.post);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                {/*== 结构化数据 ==*/}
                <script dangerouslySetInnerHTML={{ __html: postJsonLd }} type="application/ld+json" />

                {/*== 文章详情 ==*/}
                <PostDetail post={pageData.post} />
            </div>
        </main>
    );
}
