/*============================================================================
  blog query - 列表页 URL 查询解析

  将 Next.js 路由参数转换为博客领域可直接使用的规范分页查询。
============================================================================*/

import { normalizePublishedPostsPageQuery } from "@/lib/domain/posts";
import type { NormalizedPublishedPostsPageQuery } from "@/types/post";

export interface BlogSearchParams {
    category?: string | string[];
    page?: string | string[];
    tags?: string | string[];
}

export function parseBlogSearchParams(searchParams: BlogSearchParams): NormalizedPublishedPostsPageQuery {
    const page = getFirstSearchParam(searchParams.page);
    const tags = getFirstSearchParam(searchParams.tags);

    return normalizePublishedPostsPageQuery({
        categorySlug: getFirstSearchParam(searchParams.category),
        page: page === undefined ? undefined : Number(page),
        tagSlugs: tags?.split(","),
    });
}

function getFirstSearchParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}
