/*============================================================================
  posts API - 文章列表

  按分类和标签分页返回已发布文章的预览数据，不包含正文内容。
============================================================================*/

import { getPublicApiRateLimitError, jsonSuccess, withApiErrorHandling } from "@/lib/core/api";
import { getPublishedPostsPage, PUBLISHED_POSTS_CACHE_SECONDS, PUBLISHED_POSTS_STALE_SECONDS } from "@/lib/domain/posts";

export const dynamic = "force-dynamic";
/*== MySQL 驱动依赖 Node.js 运行时 ==*/
export const runtime = "nodejs";

export async function GET(request: Request) {
    const rateLimitError = getPublicApiRateLimitError(request, "published-posts");

    if (rateLimitError) return rateLimitError;

    const searchParams = new URL(request.url).searchParams;

    return withApiErrorHandling(async () => {
        const data = await getPublishedPostsPage({
            categorySlug: getStringParam(searchParams, "category"),
            page: getNumericParam(searchParams, "page"),
            pageSize: getNumericParam(searchParams, "pageSize"),
            tagSlugs: getStringParam(searchParams, "tags")?.split(","),
        });

        return jsonSuccess(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${PUBLISHED_POSTS_CACHE_SECONDS}, stale-while-revalidate=${PUBLISHED_POSTS_STALE_SECONDS}`,
            },
        });
    });
}

function getNumericParam(searchParams: URLSearchParams, name: string): number | undefined {
    const value = getStringParam(searchParams, name);

    return value === undefined ? undefined : Number(value);
}

function getStringParam(searchParams: URLSearchParams, name: string): string | undefined {
    return searchParams.get(name) ?? undefined;
}
