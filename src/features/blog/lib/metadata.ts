/*============================================================================
  blog metadata - 博客列表元数据

  根据筛选状态与分页数据生成博客列表的动态 SEO 元数据。
============================================================================*/

import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, SITE_METADATA } from "@/config/metadata";
import { getBlogHref, getTagSlugs, type BlogFilterState } from "@/features/blog/lib/filters";
import type { PublishedPostsPage } from "@/types/post";

interface BlogMetadataData {
    filters: BlogFilterState;
    pageData: Pick<PublishedPostsPage, "page" | "totalPages">;
}

export function buildBlogMetadata(blogData: BlogMetadataData | null): Metadata {
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
    const tagSlugs = getTagSlugs(filters);
    /*== 超出总页数时页面会重定向到最后有效页，metadata 先据此生成规范地址 ==*/
    const currentPage = pageData.totalPages > 0 ? Math.min(pageData.page, pageData.totalPages) : 1;
    const title = buildPageTitle(filters, currentPage);
    const description = buildPageDescription(filters, currentPage);
    const canonical = getBlogHref({
        categorySlug: filters.category?.slug,
        page: currentPage,
        tagSlugs,
    });
    const hasActiveFilters = Boolean(filters.category) || tagSlugs.length > 0;

    return {
        title,
        description,
        alternates: { canonical },
        /*== 筛选组合属于派生列表，保留跳转能力但不参与搜索索引以避免重复收录 ==*/
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
        ...(filters.category ? [filters.category.name] : []),
        ...(filters.tags.length > 0 ? [filters.tags.map((tag) => tag.name).join(" / ")] : []),
        ...(currentPage > 1 ? [`第 ${currentPage} 页`] : []),
    ].join(" · ");
}

function buildPageDescription(filters: BlogFilterState, currentPage: number): string {
    const descriptions: string[] = [SITE_METADATA.description];

    if (filters.category) {
        descriptions.push(`分类：${filters.category.name}。`);
    }

    if (filters.tags.length > 0) {
        descriptions.push(`标签：${filters.tags.map((tag) => tag.name).join("、")}。`);
    }

    if (currentPage > 1) {
        descriptions.push(`第 ${currentPage} 页。`);
    }

    return descriptions.join(" ");
}
