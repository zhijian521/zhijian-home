/*============================================================================
  posts - 文章只读数据

  首页与公开 API 共用的最新文章查询；依赖不可用时由调用方按场景处理。
============================================================================*/

import "server-only";

import { unstable_cache } from "next/cache";
import type { RowDataPacket } from "mysql2";

import { getDb } from "@/lib/core/db";
import { ServiceUnavailableError } from "@/lib/core/errors";
import type { LatestPost } from "@/types/post";

/*== 首页与 API 共用的缓存时长 ==*/
const LATEST_POST_LIMIT = 3;
export const LATEST_POSTS_CACHE_SECONDS = 60;
export const LATEST_POSTS_STALE_SECONDS = 300;

interface LatestPostRow extends RowDataPacket {
    slug: string;
    title: string;
    summary: string | null;
    category_name: string | null;
    published_at: string | null;
    updated_at: string | null;
    cover_image: string | null;
    alt_text: string | null;
}

/*== 仅查询已发布文章，排序优先使用最近更新时间，再回退发布时间 ==*/
async function queryLatestPosts(): Promise<LatestPost[]> {
    const db = getDb();

    if (!db) {
        /*== 查询层不返回伪数据，由页面和 API 分别决定降级响应 ==*/
        throw new ServiceUnavailableError();
    }

    let rows: LatestPostRow[];

    try {
        [rows] = await db.execute<LatestPostRow[]>(
            `
                SELECT
                    p.slug,
                    p.title,
                    p.summary,
                    c.name AS category_name,
                    DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                    p.cover_image,
                    p.alt_text
                FROM zhijian_blog_posts p
                LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                WHERE p.status = ?
                ORDER BY p.updated_at DESC, p.published_at DESC, p.id DESC
                LIMIT ?
            `,
            ["published", LATEST_POST_LIMIT]
        );
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }

    return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        categoryName: row.category_name,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        coverImage: getSafeCoverImage(row.cover_image),
        altText: row.alt_text,
    }));
}

/*== 统一缓存入口，避免首页与 API 分别绕过服务端缓存 ==*/
export const getLatestPosts = unstable_cache(queryLatestPosts, ["latest-posts"], {
    revalidate: LATEST_POSTS_CACHE_SECONDS,
    tags: ["latest-posts"],
});

/*== 封面地址白名单：仅接受站内绝对路径或 HTTPS ==*/
function getSafeCoverImage(value: string | null): string | null {
    const coverImage = value?.trim();

    if (!coverImage) {
        return null;
    }

    if (coverImage.startsWith("/") && !coverImage.startsWith("//")) {
        return coverImage;
    }

    try {
        const url = new URL(coverImage);
        return url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}
