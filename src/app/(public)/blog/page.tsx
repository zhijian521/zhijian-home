/*============================================================================
  blog page - 文章列表页

  服务端读取分页文章及筛选项，筛选状态保留在 URL 中。
============================================================================*/

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/ui/pagination";
import { TextButton } from "@/components/ui/text-button";
import { buildBlogMetadata } from "@/features/blog/lib/metadata";
import { buildBlogActiveFilters, buildBlogFilterOptions, getBlogHref, getTagSlugs } from "@/features/blog/lib/filters";
import { getBlogListPageData } from "@/features/blog/lib/list-page-data";
import { BlogFilters } from "@/features/blog/ui/blog-filters";
import { PostList } from "@/features/blog/ui/post-list";
import { normalizePublishedPostsPageQuery } from "@/lib/domain/posts";
import type { NormalizedPublishedPostsPageQuery } from "@/types/post";

import styles from "./page.module.css";

interface BlogSearchParams {
    category?: string | string[];
    page?: string | string[];
    tags?: string | string[];
}

interface BlogPageProps {
    searchParams: Promise<BlogSearchParams>;
}

/*== 分页与筛选均依赖 URL 参数，数据读取与缓存由博客 feature 和领域层管理 ==*/
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const query = getBlogQuery(await searchParams);
    const pageData = await getBlogListPageData(query);

    return buildBlogMetadata(pageData);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const query = getBlogQuery(await searchParams);
    const blogData = await getBlogListPageData(query);

    if (!blogData) {
        return <BlogUnavailable />;
    }

    const { filterOptions, filters, pageData } = blogData;
    const tagSlugs = getTagSlugs(filters);

    /*== 保留有效筛选条件并回到最后一页，避免超页链接渲染为空列表 ==*/
    if (pageData.totalPages > 0 && pageData.page > pageData.totalPages) {
        redirect(
            getBlogHref({
                categorySlug: filters.category?.slug,
                page: pageData.totalPages,
                tagSlugs,
            }),
        );
    }

    /*== 当前筛选分页状态 ==*/
    const currentPage = pageData.totalPages > 0 ? pageData.page : 1;
    const { categories, tags } = buildBlogFilterOptions(filters, filterOptions);
    const activeFilters = buildBlogActiveFilters(filters);
    const hasActiveFilters = Boolean(filters.category) || tagSlugs.length > 0;

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>文章</h1>
                </header>

                <div className={styles.layout}>
                    <BlogFilters
                        activeFilters={activeFilters}
                        categories={categories}
                        clearAllHref={hasActiveFilters ? getBlogHref() : undefined}
                        tags={tags}
                    />

                    <div className={styles.content}>
                        {pageData.posts.length > 0 ? (
                            <PostList posts={pageData.posts} />
                        ) : (
                            <section aria-labelledby="blog-empty-title" className={styles.status}>
                                <h2 id="blog-empty-title">暂无文章</h2>
                                <p>{hasActiveFilters ? "没有符合当前筛选条件的文章。" : "新的文章会在这里发布。"}</p>
                            </section>
                        )}

                        <Pagination
                            ariaLabel="文章分页"
                            current={currentPage}
                            getHref={(page) =>
                                getBlogHref({
                                    categorySlug: filters.category?.slug,
                                    page,
                                    tagSlugs,
                                })
                            }
                            total={pageData.totalPages}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

function BlogUnavailable() {
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <section aria-labelledby="blog-unavailable-title" className={styles.status}>
                    <h1 id="blog-unavailable-title">文章</h1>
                    <p>文章暂时无法加载，请稍后再试。</p>
                    <TextButton href="/" icon="arrow-right">
                        返回首页
                    </TextButton>
                </section>
            </div>
        </main>
    );
}

function getBlogQuery(searchParams: BlogSearchParams): NormalizedPublishedPostsPageQuery {
    const page = getSearchParam(searchParams.page);
    const tags = getSearchParam(searchParams.tags);

    return normalizePublishedPostsPageQuery({
        categorySlug: getSearchParam(searchParams.category),
        page: page === undefined ? undefined : Number(page),
        tagSlugs: tags?.split(","),
    });
}

function getSearchParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}
