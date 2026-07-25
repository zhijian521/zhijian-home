/*============================================================================
  latest posts API - 最新文章

  仅暴露首页需要的三篇已发布文章，不接受额外筛选或分页参数。
============================================================================*/

import { NextResponse } from "next/server";

import { withApiErrorHandling } from "@/lib/core/api";
import { checkRateLimit, PUBLIC_API_RATE_LIMIT } from "@/lib/core/rate-limit";
import { getLatestPosts, LATEST_POSTS_CACHE_SECONDS, LATEST_POSTS_STALE_SECONDS } from "@/lib/domain/posts";

export const dynamic = "force-dynamic";
/*== MySQL 驱动依赖 Node.js 运行时 ==*/
export const runtime = "nodejs";

export async function GET(request: Request) {
    /*== 生产 Nginx 需覆盖 X-Real-IP，避免客户端伪造转发地址绕过限流 ==*/
    const clientIp = request.headers.get("x-real-ip")?.slice(0, 64) ?? "anonymous";
    const rateLimit = checkRateLimit(`latest-posts:${clientIp}`, PUBLIC_API_RATE_LIMIT);

    if (!rateLimit.allowed) {
        /*== 限流响应不缓存，避免不同客户端继承 429 ==*/
        return NextResponse.json(
            {
                error: {
                    code: "RATE_LIMITED",
                    message: "请求过于频繁，请稍后再试。",
                },
            },
            {
                status: 429,
                headers: {
                    "Cache-Control": "no-store",
                    "Retry-After": String(rateLimit.retryAfterSeconds),
                },
            }
        );
    }

    /*== 正常响应使用共享文章缓存周期，降低数据库读取频率 ==*/
    return withApiErrorHandling(async () => {
        const data = await getLatestPosts();

        return NextResponse.json(
            { data },
            {
                headers: {
                    "Cache-Control": `public, s-maxage=${LATEST_POSTS_CACHE_SECONDS}, stale-while-revalidate=${LATEST_POSTS_STALE_SECONDS}`,
                },
            }
        );
    });
}
