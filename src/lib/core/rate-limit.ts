/*============================================================================
  rate-limit - 进程内接口限流

  作为应用层兜底；多实例生产部署仍需由 Nginx 或网关统一限流。
============================================================================*/

import "server-only";

interface RateLimitBucket {
    count: number;
    resetAt: number;
}

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 10_000;
let lastPrunedAt = 0;

/*== 公开接口默认策略：同一客户端每分钟最多 60 次 ==*/
export const PUBLIC_API_RATE_LIMIT: RateLimitOptions = {
    limit: 60,
    windowMs: 60_000,
};

export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();

    if (now - lastPrunedAt >= options.windowMs) {
        pruneExpiredBuckets(now);
    }

    const bucket = buckets.get(identifier);

    if (!bucket || bucket.resetAt <= now) {
        if (buckets.size >= MAX_BUCKETS) {
            pruneExpiredBuckets(now);
        }

        if (buckets.size >= MAX_BUCKETS) {
            const oldestIdentifier = buckets.keys().next().value;

            if (oldestIdentifier) {
                /*== 淘汰最早条目，限制伪造大量客户端标识导致的进程内存增长 ==*/
                buckets.delete(oldestIdentifier);
            }
        }

        buckets.set(identifier, {
            count: 1,
            resetAt: now + options.windowMs,
        });

        return {
            allowed: true,
            retryAfterSeconds: Math.ceil(options.windowMs / 1000),
        };
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    if (bucket.count >= options.limit) {
        return {
            allowed: false,
            retryAfterSeconds,
        };
    }

    bucket.count += 1;

    return {
        allowed: true,
        retryAfterSeconds,
    };
}

/*== 每个窗口周期清理过期桶，避免限流状态长期增长 ==*/
function pruneExpiredBuckets(now: number) {
    for (const [identifier, bucket] of buckets) {
        if (bucket.resetAt <= now) {
            buckets.delete(identifier);
        }
    }

    lastPrunedAt = now;
}
