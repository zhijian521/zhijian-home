/*============================================================================
  blog filters API - 博客筛选项

  返回博客列表可用的分类和标签，不与分页文章接口混合。
============================================================================*/

import { jsonError, jsonSuccess, withApiErrorHandling } from "@/lib/core/api";
import { checkRateLimit, PUBLIC_API_RATE_LIMIT } from "@/lib/core/rate-limit";
import { getClientIp } from "@/lib/core/request-ip";
import { getPublishedPostFilters, POST_FILTERS_CACHE_SECONDS, POST_FILTERS_STALE_SECONDS } from "@/lib/domain/post-filters";

export const dynamic = "force-dynamic";
/*== MySQL 驱动依赖 Node.js 运行时 ==*/
export const runtime = "nodejs";

export async function GET(request: Request) {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`blog-filters:${clientIp}`, PUBLIC_API_RATE_LIMIT);

    if (!rateLimit.allowed) {
        return jsonError("RATE_LIMITED", "请求过于频繁，请稍后再试。", {
            status: 429,
            headers: {
                "Retry-After": String(rateLimit.retryAfterSeconds),
            },
        });
    }

    return withApiErrorHandling(async () => {
        const data = await getPublishedPostFilters();

        /*== HTTP 缓存减少请求进入应用；数据库读取仍由领域层缓存统一去重 ==*/
        return jsonSuccess(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${POST_FILTERS_CACHE_SECONDS}, stale-while-revalidate=${POST_FILTERS_STALE_SECONDS}`,
            },
        });
    });
}
