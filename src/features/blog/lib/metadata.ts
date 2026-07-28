/*============================================================================
  blog metadata - 博客列表元数据

  根据筛选状态与分页数据生成博客列表的动态 SEO 元数据。
============================================================================*/

import type { Metadata } from "next";

import { HERO_CONTENT } from "@/config/home";
import { DEFAULT_OG_IMAGE, SITE_METADATA } from "@/config/metadata";
import { getBlogHref, getTagSlugs, type BlogFilterState } from "@/features/blog/lib/filters";
import { toPostIsoDateTime } from "@/lib/core/date";
import { serializeJsonLd } from "@/lib/core/json-ld";
import type { PublishedPostDetail, PublishedPostsPage } from "@/types/post";

interface BlogMetadataData {
    filters: BlogFilterState;
    pageData: Pick<PublishedPostsPage, "page" | "totalPages">;
}

interface BlogJsonLdData {
    filters: BlogFilterState;
    pageData: Pick<PublishedPostsPage, "page" | "pageSize" | "posts" | "totalPages">;
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
    /*== 超出总页数时页面会重定向到最后有效页，metadata 先据此生成规范地址 ==*/
    const currentPage = getCurrentBlogPage(pageData);
    const title = buildPageTitle(filters, currentPage);
    const description = buildPageDescription(filters, currentPage);
    const canonical = getBlogPageHref(filters, currentPage);
    const hasActiveFilters = Boolean(filters.category) || filters.tags.length > 0;

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

/*== 列表页仅声明当前分页实际展示的文章，筛选后的派生 URL 仍沿用页面 metadata 的 noindex 策略 ==*/
export function buildBlogJsonLd({ filters, pageData }: BlogJsonLdData): string {
    const currentPage = getCurrentBlogPage(pageData);
    const pageHref = getBlogPageHref(filters, currentPage);
    const pageUrl = new URL(pageHref, SITE_METADATA.siteUrl).toString();
    const pageName = buildPageTitle(filters, currentPage);
    const listStartIndex = (currentPage - 1) * pageData.pageSize;

    return serializeJsonLd({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${pageUrl}#page`,
                url: pageUrl,
                name: pageName,
                description: buildPageDescription(filters, currentPage),
                inLanguage: "zh-CN",
                mainEntity: { "@id": `${pageUrl}#list` },
            },
            {
                "@type": "ItemList",
                "@id": `${pageUrl}#list`,
                name: `${pageName}列表`,
                itemListOrder: "https://schema.org/ItemListOrderDescending",
                numberOfItems: pageData.posts.length,
                itemListElement: pageData.posts.map((post, index) => ({
                    "@type": "ListItem",
                    position: listStartIndex + index + 1,
                    url: getPostHref(post.slug),
                    name: post.title,
                    description: post.summary ?? undefined,
                })),
            },
        ],
    });
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

/*== 文章详情只声明已发布内容；数据不可用时禁止收录故障页。 ==*/
export function buildPostMetadata(post: PublishedPostDetail | null): Metadata {
    if (!post) {
        return {
            title: "文章",
            robots: {
                index: false,
                follow: false,
                noarchive: true,
            },
        };
    }

    const title = post.title;
    const description = post.summary ?? SITE_METADATA.description;
    const canonical = getPostHref(post.slug);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const tagNames = post.tags.map((tag) => tag.name);

    return {
        title,
        description,
        keywords: [...tagNames, ...(post.categoryName ? [post.categoryName] : []), ...SITE_METADATA.keywords],
        alternates: { canonical },
        openGraph: {
            type: "article",
            title,
            description,
            url: canonical,
            publishedTime,
            modifiedTime,
            authors: [HERO_CONTENT.author],
            section: post.categoryName ?? undefined,
            tags: tagNames,
            images: [
                post.coverImage
                    ? { url: post.coverImage, alt: post.altText ?? post.title }
                    : { url: DEFAULT_OG_IMAGE, alt: SITE_METADATA.brandTitle },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [post.coverImage ?? DEFAULT_OG_IMAGE],
        },
    };
}

export function buildPostJsonLd(post: PublishedPostDetail): string {
    const canonical = getPostHref(post.slug);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const image = post.coverImage ? new URL(post.coverImage, SITE_METADATA.siteUrl).toString() : undefined;

    return serializeJsonLd({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: post.title,
        description: post.summary ?? SITE_METADATA.description,
        image,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: {
            "@type": "Person",
            name: HERO_CONTENT.author,
            url: SITE_METADATA.siteUrl.toString(),
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonical,
        },
        articleSection: post.categoryName ?? undefined,
        keywords: post.tags.map((tag) => tag.name).join(", ") || undefined,
        inLanguage: "zh-CN",
    });
}

function getCurrentBlogPage(pageData: Pick<PublishedPostsPage, "page" | "totalPages">): number {
    return pageData.totalPages > 0 ? Math.min(pageData.page, pageData.totalPages) : 1;
}

function getBlogPageHref(filters: BlogFilterState, page: number): string {
    return getBlogHref({
        categorySlug: filters.category?.slug,
        page,
        tagSlugs: getTagSlugs(filters),
    });
}

function getPostHref(slug: string): string {
    return new URL(`/blog/${slug}`, SITE_METADATA.siteUrl).toString();
}
