/*============================================================================
  latest posts API - 最新文章

  仅暴露首页需要的三篇已发布文章，不接受额外筛选或分页参数。
============================================================================*/

import { getPublicApiRateLimitError, jsonSuccess, withApiErrorHandling } from "@/lib/core/api";
import { getLatestPosts, PUBLISHED_POSTS_CACHE_SECONDS, PUBLISHED_POSTS_STALE_SECONDS } from "@/lib/domain/posts";

export const dynamic = "force-dynamic";
/*== MySQL 驱动依赖 Node.js 运行时 ==*/
export const runtime = "nodejs";

export async function GET(request: Request) {
    const rateLimitError = getPublicApiRateLimitError(request, "latest-posts");

    if (rateLimitError) return rateLimitError;

    /*== 正常响应使用共享文章缓存周期，降低数据库读取频率 ==*/
    return withApiErrorHandling(async () => {
        const data = await getLatestPosts();

        return jsonSuccess(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${PUBLISHED_POSTS_CACHE_SECONDS}, stale-while-revalidate=${PUBLISHED_POSTS_STALE_SECONDS}`,
            },
        });
    });
}
