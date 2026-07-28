/*============================================================================
  blog-filters - 博客筛选状态

  将已校验的分类、标签转换为列表页筛选状态及可分享的 URL。
============================================================================*/

import type { NormalizedPublishedPostsPageQuery, PostFilterOption, PublishedPostFilters } from "@/types/post";

export interface BlogFilterState {
    category?: PostFilterOption;
    tags: PostFilterOption[];
}

export interface BlogFilterOption {
    href: string;
    isActive: boolean;
    label: string;
}

interface BlogHrefOptions {
    categorySlug?: string;
    page?: number;
    tagSlugs?: string[];
}

/*== 丢弃不存在的分类与标签，避免无效 URL 影响文章查询与页面状态 ==*/
export function resolveBlogFilterState(
    query: Pick<NormalizedPublishedPostsPageQuery, "categorySlug" | "tagSlugs">,
    filterOptions: PublishedPostFilters,
): BlogFilterState {
    const category = query.categorySlug ? filterOptions.categories.find((option) => option.slug === query.categorySlug) : undefined;
    const tagsBySlug = new Map(filterOptions.tags.map((tag) => [tag.slug, tag]));
    const tags = query.tagSlugs.map((slug) => tagsBySlug.get(slug)).filter((tag): tag is PostFilterOption => tag !== undefined);

    return { category, tags };
}

export function getTagSlugs(filters: BlogFilterState): string[] {
    return filters.tags.map((tag) => tag.slug);
}

/*== 默认第一页不写入 URL，确保“全部”与各筛选链接保持稳定的规范地址 ==*/
export function getBlogHref({ categorySlug, page = 1, tagSlugs = [] }: BlogHrefOptions = {}): string {
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

/*== 切换分类或标签时不携带页码，避免条件改变后落到无效的旧分页 ==*/
export function buildBlogFilterOptions(
    filters: BlogFilterState,
    filterOptions: PublishedPostFilters,
): { categories: BlogFilterOption[]; tags: BlogFilterOption[] } {
    const tagSlugs = getTagSlugs(filters);
    const activeTagSlugs = new Set(tagSlugs);

    return {
        categories: [
            {
                href: getBlogHref({ tagSlugs }),
                isActive: !filters.category,
                label: "全部",
            },
            ...filterOptions.categories.map((category) => ({
                href: getBlogHref({ categorySlug: category.slug, tagSlugs }),
                isActive: category.slug === filters.category?.slug,
                label: category.name,
            })),
        ],
        tags: filterOptions.tags.map((tag) => {
            const isActive = activeTagSlugs.has(tag.slug);
            const nextTagSlugs = isActive ? tagSlugs.filter((slug) => slug !== tag.slug) : [...tagSlugs, tag.slug];

            return {
                href: getBlogHref({ categorySlug: filters.category?.slug, tagSlugs: nextTagSlugs }),
                isActive,
                label: tag.name,
            };
        }),
    };
}
