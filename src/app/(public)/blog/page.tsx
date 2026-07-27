/*============================================================================
  blog page - 文章列表页

  服务端读取分页文章及筛选项，筛选状态保留在 URL 中。
============================================================================*/

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";

import { BlogFilters, type BlogActiveFilter, type BlogFilterOption } from "@/components/blog/blog-filters";
import { PostList } from "@/components/blog/post-list";
import { Pagination } from "@/components/ui/pagination";
import { TextButton } from "@/components/ui/text-button";
import { DEFAULT_OG_IMAGE, SITE_METADATA } from "@/config/metadata";
import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getPublishedPostFilters, getPublishedPostsPage, normalizePublishedPostsPageQuery } from "@/lib/domain/posts";
import type { NormalizedPublishedPostsPageQuery, PostFilterOption, PublishedPostFilters, PublishedPostsPage } from "@/types/post";

import styles from "./page.module.css";

interface BlogSearchParams {
    category?: string | string[];
    page?: string | string[];
    tags?: string | string[];
}

interface BlogPageProps {
    searchParams: Promise<BlogSearchParams>;
}

interface BlogFilterState {
    categoryName?: string;
    categorySlug?: string;
    tagNames: string[];
    tagSlugs: string[];
}

interface BlogPageData {
    filterOptions: PublishedPostFilters;
    filters: BlogFilterState;
    pageData: PublishedPostsPage;
}

interface BlogHrefOptions {
    categorySlug?: string;
    page?: number;
    tagSlugs?: string[];
}

/*== 同一请求内由 metadata 与页面渲染共享，避免重复读取筛选项和文章列表 ==*/
const getBlogPage = cache(async (page: number, requestedCategorySlug: string, requestedTagSlugsValue: string): Promise<BlogPageData | null> => {
    try {
        const filterOptions = await getPublishedPostFilters();
        const filters = resolveBlogFilterState(
            {
                categorySlug: requestedCategorySlug || undefined,
                tagSlugs: requestedTagSlugsValue ? requestedTagSlugsValue.split(",") : [],
            },
            filterOptions,
        );
        const pageData = await getPublishedPostsPage({
            categorySlug: filters.categorySlug,
            page,
            tagSlugs: filters.tagSlugs,
        });

        return { filterOptions, filters, pageData };
    } catch (error) {
        if (isServiceUnavailableError(error)) {
            console.error("博客列表文章或筛选项不可用：", getErrorLogContext(error));
            return null;
        }

        throw error;
    }
});

/*== 分页与筛选均依赖 URL 参数，数据缓存由领域层统一管理 ==*/
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const query = getBlogQuery(await searchParams);
    const pageData = await getBlogPage(query.page, query.categorySlug ?? "", query.tagSlugs.join(","));

    return buildMetadata(pageData);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const query = getBlogQuery(await searchParams);
    const blogData = await getBlogPage(query.page, query.categorySlug ?? "", query.tagSlugs.join(","));

    if (!blogData) {
        return <BlogUnavailable />;
    }

    const { filterOptions, filters, pageData } = blogData;

    if (pageData.totalPages > 0 && pageData.page > pageData.totalPages) {
        redirect(
            getBlogHref({
                categorySlug: filters.categorySlug,
                page: pageData.totalPages,
                tagSlugs: filters.tagSlugs,
            }),
        );
    }

    const currentPage = pageData.totalPages > 0 ? pageData.page : 1;
    const { categories, tags } = buildBlogFilterOptions(filters, filterOptions);
    const activeFilters = buildBlogActiveFilters(filters);
    const hasActiveFilters = Boolean(filters.categorySlug) || filters.tagSlugs.length > 0;

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
                                    categorySlug: filters.categorySlug,
                                    page,
                                    tagSlugs: filters.tagSlugs,
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

function resolveBlogFilterState(
    query: Pick<NormalizedPublishedPostsPageQuery, "categorySlug" | "tagSlugs">,
    filterOptions: PublishedPostFilters,
): BlogFilterState {
    const category = query.categorySlug ? filterOptions.categories.find((option) => option.slug === query.categorySlug) : undefined;
    const tagsBySlug = new Map(filterOptions.tags.map((tag) => [tag.slug, tag]));
    const tags = query.tagSlugs.map((slug) => tagsBySlug.get(slug)).filter((tag): tag is PostFilterOption => tag !== undefined);

    return {
        categoryName: category?.name,
        categorySlug: category?.slug,
        tagNames: tags.map((tag) => tag.name),
        tagSlugs: tags.map((tag) => tag.slug),
    };
}

function buildBlogFilterOptions(
    filters: BlogFilterState,
    filterOptions: PublishedPostFilters,
): { categories: BlogFilterOption[]; tags: BlogFilterOption[] } {
    const activeTagSlugs = new Set(filters.tagSlugs);

    return {
        categories: [
            {
                href: getBlogHref({ tagSlugs: filters.tagSlugs }),
                isActive: !filters.categorySlug,
                label: "全部",
            },
            ...filterOptions.categories.map((category) => ({
                href: getBlogHref({ categorySlug: category.slug, tagSlugs: filters.tagSlugs }),
                isActive: category.slug === filters.categorySlug,
                label: category.name,
            })),
        ],
        tags: filterOptions.tags.map((tag) => {
            const isActive = activeTagSlugs.has(tag.slug);
            const tagSlugs = isActive ? filters.tagSlugs.filter((slug) => slug !== tag.slug) : [...filters.tagSlugs, tag.slug];

            return {
                href: getBlogHref({ categorySlug: filters.categorySlug, tagSlugs }),
                isActive,
                label: tag.name,
            };
        }),
    };
}

function buildBlogActiveFilters(filters: BlogFilterState): BlogActiveFilter[] {
    const activeFilters: BlogActiveFilter[] = [];

    if (filters.categoryName && filters.categorySlug) {
        activeFilters.push({
            href: getBlogHref({ tagSlugs: filters.tagSlugs }),
            id: `category:${filters.categorySlug}`,
            label: filters.categoryName,
        });
    }

    filters.tagSlugs.forEach((tagSlug, index) => {
        activeFilters.push({
            href: getBlogHref({
                categorySlug: filters.categorySlug,
                tagSlugs: filters.tagSlugs.filter((slug) => slug !== tagSlug),
            }),
            id: `tag:${tagSlug}`,
            label: filters.tagNames[index],
        });
    });

    return activeFilters;
}

function getBlogHref({ categorySlug, page = 1, tagSlugs = [] }: BlogHrefOptions = {}): string {
    const searchParams = new URLSearchParams();

    if (categorySlug) {
        searchParams.set("category", categorySlug);
    }

    if (tagSlugs.length > 0) {
        searchParams.set("tags", tagSlugs.join(","));
    }

    if (page > 1) {
        searchParams.set("page", String(page));
    }

    const query = searchParams.toString();

    return query ? `/blog?${query}` : "/blog";
}

function buildMetadata(blogData: BlogPageData | null): Metadata {
    if (!blogData) {
        return {
            title: "文章",
            description: SITE_METADATA.description,
            robots: {
                index: false,
                follow: false,
                noarchive: true,
            },
        };
    }

    const { filters, pageData } = blogData;
    const currentPage = pageData.totalPages > 0 ? Math.min(pageData.page, pageData.totalPages) : 1;
    const title = buildPageTitle(filters, currentPage);
    const description = buildPageDescription(filters, currentPage);
    const canonical = getBlogHref({
        categorySlug: filters.categorySlug,
        page: currentPage,
        tagSlugs: filters.tagSlugs,
    });
    const hasActiveFilters = Boolean(filters.categorySlug) || filters.tagSlugs.length > 0;

    return {
        title,
        description,
        alternates: { canonical },
        robots: hasActiveFilters
            ? {
                  index: false,
                  follow: true,
              }
            : undefined,
        openGraph: {
            title,
            description,
            url: canonical,
            images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_METADATA.brandTitle }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [DEFAULT_OG_IMAGE],
        },
    };
}

function buildPageTitle(filters: BlogFilterState, currentPage: number): string {
    return [
        "文章",
        ...(filters.categoryName ? [filters.categoryName] : []),
        ...(filters.tagNames.length > 0 ? [filters.tagNames.join(" / ")] : []),
        ...(currentPage > 1 ? [`第 ${currentPage} 页`] : []),
    ].join(" · ");
}

function buildPageDescription(filters: BlogFilterState, currentPage: number): string {
    const descriptions: string[] = [SITE_METADATA.description];

    if (filters.categoryName) {
        descriptions.push(`分类：${filters.categoryName}。`);
    }

    if (filters.tagNames.length > 0) {
        descriptions.push(`标签：${filters.tagNames.join("、")}。`);
    }

    if (currentPage > 1) {
        descriptions.push(`第 ${currentPage} 页。`);
    }

    return descriptions.join(" ");
}
