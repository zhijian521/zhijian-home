/*============================================================================
  post-filters - 文章筛选项

  博客列表与公开筛选接口共用的已发布文章分类、标签读取逻辑。
============================================================================*/

import "server-only";

import { unstable_cache } from "next/cache";
import type { RowDataPacket } from "mysql2";

import { getDb } from "@/lib/core/db";
import { ServiceUnavailableError } from "@/lib/core/errors";
import type { PostFilterOption, PublishedPostFilters } from "@/types/post";

export const POST_FILTERS_CACHE_SECONDS = 60;
export const POST_FILTERS_STALE_SECONDS = 300;

interface PostFilterOptionRow extends RowDataPacket {
    name: string;
    slug: string;
}

/*== 读取文章筛选项；数据库不可用时抛出 ServiceUnavailableError。==*/
export async function getPublishedPostFilters(): Promise<PublishedPostFilters> {
    return getCachedPublishedPostFilters();
}

/*== 分类和标签按旧站顺序并行查询，供博客列表生成可分享的筛选链接 ==*/
const getCachedPublishedPostFilters = unstable_cache(queryPublishedPostFilters, ["published-post-filters"], {
    revalidate: POST_FILTERS_CACHE_SECONDS,
    tags: ["published-post-filters"],
});

async function queryPublishedPostFilters(): Promise<PublishedPostFilters> {
    const db = getDb();

    if (!db) {
        throw new ServiceUnavailableError();
    }

    try {
        const [[categoryRows], [tagRows]] = await Promise.all([
            db.execute<PostFilterOptionRow[]>(
                `
                    SELECT c.name, c.slug
                    FROM zhijian_blog_categories c
                    ORDER BY c.sort_order ASC, c.id ASC
                `,
            ),
            db.execute<PostFilterOptionRow[]>(
                `
                    SELECT t.name, t.slug
                    FROM zhijian_blog_tags t
                    ORDER BY t.id ASC
                `,
            ),
        ]);

        return {
            categories: categoryRows.map(toPostFilterOption),
            tags: tagRows.map(toPostFilterOption),
        };
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

function toPostFilterOption(row: PostFilterOptionRow): PostFilterOption {
    return {
        name: row.name,
        slug: row.slug,
    };
}
