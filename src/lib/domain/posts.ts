/*============================================================================
  posts - 文章只读数据

  首页最新文章、博客列表与对应公开 API 共用的文章查询；依赖不可用时由调用方按场景处理。
============================================================================*/

import "server-only";

import { unstable_cache } from "next/cache";
import type { RowDataPacket } from "mysql2";
import type { Pool } from "mysql2/promise";

import { getDb } from "@/lib/core/db";
import { ServiceUnavailableError } from "@/lib/core/errors";
import type {
    NormalizedPublishedPostsPageQuery,
    PostFilterOption,
    PostPreview,
    PublishedPostDetail,
    PublishedPostsPage,
    PublishedPostsPageQuery,
} from "@/types/post";

/*== 已发布文章查询的共享缓存时长 ==*/
const LATEST_POST_LIMIT = 3;
export const PUBLISHED_POSTS_CACHE_SECONDS = 60;
export const PUBLISHED_POSTS_STALE_SECONDS = 300;
const DEFAULT_POSTS_PAGE_SIZE = 10;
const MAX_POSTS_PAGE = 1_000;
const MAX_POSTS_PAGE_SIZE = 100;
const MAX_POSTS_TAG_FILTERS = 20;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface PostPreviewRow extends RowDataPacket {
    slug: string;
    title: string;
    summary: string | null;
    category_name: string | null;
    published_at: string | null;
    updated_at: string | null;
    cover_image: string | null;
    alt_text: string | null;
}

interface PostCountRow extends RowDataPacket {
    total: number;
}

interface PublishedPostDetailRow extends PostPreviewRow {
    content: string | null;
    category_slug: string | null;
    tags: number[] | string | null;
}

interface PostTagRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
}

/*== 仅查询已发布文章，排序优先使用最近更新时间，再回退发布时间 ==*/
async function queryLatestPosts(): Promise<PostPreview[]> {
    const db = getDb();

    if (!db) {
        /*== 查询层不返回伪数据，由页面和 API 分别决定降级响应 ==*/
        throw new ServiceUnavailableError();
    }

    let rows: PostPreviewRow[];

    try {
        [rows] = await db.execute<PostPreviewRow[]>(
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
            ["published", LATEST_POST_LIMIT],
        );
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }

    return rows.map(toPostPreview);
}

/*== 统一缓存入口，避免首页与 API 分别绕过服务端缓存 ==*/
export const getLatestPosts = unstable_cache(queryLatestPosts, ["latest-posts"], {
    revalidate: PUBLISHED_POSTS_CACHE_SECONDS,
    tags: ["latest-posts"],
});

/*== 读取一页已发布文章的最小展示数据；数据库不可用时抛出 ServiceUnavailableError。 ==*/
export async function getPublishedPostsPage(query: PublishedPostsPageQuery = {}): Promise<PublishedPostsPage> {
    const { categorySlug, page, pageSize, tagSlugs } = normalizePublishedPostsPageQuery(query);

    return getCachedPublishedPostsPage(page, pageSize, categorySlug ?? "", tagSlugs.join(","));
}

/*== 读取单篇已发布文章；非法或不存在的 slug 返回 null，依赖故障继续向上抛出。 ==*/
export async function getPublishedPostBySlug(slug: string): Promise<PublishedPostDetail | null> {
    const normalizedSlug = normalizeSlug(slug);

    if (!normalizedSlug) {
        return null;
    }

    return getCachedPublishedPostBySlug(normalizedSlug);
}

const getCachedPublishedPostBySlug = unstable_cache(queryPublishedPostBySlug, ["published-post"], {
    revalidate: PUBLISHED_POSTS_CACHE_SECONDS,
    tags: ["published-post"],
});

async function queryPublishedPostBySlug(slug: string): Promise<PublishedPostDetail | null> {
    const db = getDb();

    if (!db) {
        throw new ServiceUnavailableError();
    }

    try {
        const [rows] = await db.execute<PublishedPostDetailRow[]>(
            `
                SELECT
                    p.slug,
                    p.title,
                    p.summary,
                    p.content,
                    c.name AS category_name,
                    c.slug AS category_slug,
                    DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                    p.cover_image,
                    p.alt_text,
                    p.tags
                FROM zhijian_blog_posts p
                LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                WHERE p.status = ? AND p.slug = ?
                LIMIT 1
            `,
            ["published", slug],
        );
        const row = rows[0];

        if (!row) {
            return null;
        }

        const tags = await getPublishedPostTags(db, parsePostTagIds(row.tags));

        return {
            ...toPostPreview(row),
            content: row.content?.trim() ?? "",
            categorySlug: row.category_slug,
            tags,
        };
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

/*== 每个分页请求独立缓存，列表与总数作为同一结果返回 ==*/
const getCachedPublishedPostsPage = unstable_cache(queryPublishedPostsPage, ["published-posts-page"], {
    revalidate: PUBLISHED_POSTS_CACHE_SECONDS,
    tags: ["published-posts-page"],
});

/*== 列表与总数并行读取，避免博客列表页产生数据库查询瀑布 ==*/
async function queryPublishedPostsPage(page: number, pageSize: number, categorySlug: string, tagSlugsValue: string): Promise<PublishedPostsPage> {
    const db = getDb();

    if (!db) {
        throw new ServiceUnavailableError();
    }

    const offset = (page - 1) * pageSize;
    const tagSlugs = tagSlugsValue ? tagSlugsValue.split(",") : [];
    const { conditions, values } = buildPublishedPostsFilter(categorySlug, tagSlugs);
    const whereClause = `WHERE ${["p.status = ?", ...conditions].join(" AND ")}`;

    try {
        const [[countRows], [rows]] = await Promise.all([
            db.execute<PostCountRow[]>(
                `
                    SELECT COUNT(*) AS total
                    FROM zhijian_blog_posts p
                    LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                    ${whereClause}
                `,
                ["published", ...values],
            ),
            db.execute<PostPreviewRow[]>(
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
                ${whereClause}
                ORDER BY p.updated_at DESC, p.published_at DESC, p.id DESC
                LIMIT ? OFFSET ?
            `,
                ["published", ...values, pageSize, offset],
            ),
        ]);
        const total = Number(countRows[0]?.total ?? 0);

        return {
            posts: rows.map(toPostPreview),
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

/*== 规范化公开文章列表查询，限制页码、页大小与标签筛选数量。 ==*/
export function normalizePublishedPostsPageQuery(query: PublishedPostsPageQuery = {}): NormalizedPublishedPostsPageQuery {
    return {
        categorySlug: normalizeSlug(query.categorySlug),
        page: normalizePositiveInteger(query.page, 1, MAX_POSTS_PAGE),
        pageSize: normalizePositiveInteger(query.pageSize, DEFAULT_POSTS_PAGE_SIZE, MAX_POSTS_PAGE_SIZE),
        tagSlugs: normalizeTagSlugs(query.tagSlugs),
    };
}

function normalizePositiveInteger(value: number | undefined, fallback: number, maximum: number): number {
    if (value === undefined || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(maximum, Math.max(1, Math.floor(value)));
}

/*== 仅接受后台约束的 URL slug，避免公开筛选构造无限参数列表 ==*/
function normalizeSlug(value: string | undefined): string | undefined {
    const slug = value?.trim();

    if (!slug || slug.length > 120 || !SLUG_PATTERN.test(slug)) {
        return undefined;
    }

    return slug;
}

function normalizeTagSlugs(values: string[] | undefined): string[] {
    if (!values) {
        return [];
    }

    const tagSlugs = new Set<string>();

    for (const value of values) {
        const slug = normalizeSlug(value);

        if (!slug) {
            continue;
        }

        tagSlugs.add(slug);

        if (tagSlugs.size === MAX_POSTS_TAG_FILTERS) {
            break;
        }
    }

    return [...tagSlugs];
}

/*== 分类与标签组取交集；多个标签沿用旧站的任意命中语义 ==*/
function buildPublishedPostsFilter(categorySlug: string, tagSlugs: string[]) {
    const conditions: string[] = [];
    const values: string[] = [];

    if (categorySlug) {
        conditions.push("c.slug = ?");
        values.push(categorySlug);
    }

    if (tagSlugs.length > 0) {
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM zhijian_blog_tags filter_tag
                WHERE filter_tag.slug IN (${tagSlugs.map(() => "?").join(", ")})
                    AND JSON_CONTAINS(p.tags, CAST(filter_tag.id AS JSON), '$')
            )
        `);
        values.push(...tagSlugs);
    }

    return { conditions, values };
}

function toPostPreview(row: PostPreviewRow): PostPreview {
    return {
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        categoryName: row.category_name,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        coverImage: getSafeCoverImage(row.cover_image),
        altText: row.alt_text,
    };
}

async function getPublishedPostTags(db: Pool, tagIds: number[]): Promise<PostFilterOption[]> {
    if (tagIds.length === 0) {
        return [];
    }

    const [rows] = await db.execute<PostTagRow[]>(
        `SELECT id, name, slug FROM zhijian_blog_tags WHERE id IN (${tagIds.map(() => "?").join(", ")})`,
        tagIds,
    );
    const tagsById = new Map(rows.map((tag) => [tag.id, { name: tag.name, slug: tag.slug }]));

    return tagIds.flatMap((tagId) => {
        const tag = tagsById.get(tagId);
        return tag ? [tag] : [];
    });
}

/*== 标签 JSON 由后台维护，但仍限制数量与 ID 范围，避免详情查询构造无界参数列表。 ==*/
function parsePostTagIds(value: number[] | string | null): number[] {
    let rawTagIds: unknown = value;

    if (typeof value === "string") {
        try {
            rawTagIds = JSON.parse(value);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(rawTagIds)) {
        return [];
    }

    const tagIds = new Set<number>();

    for (const tagId of rawTagIds) {
        if (!Number.isSafeInteger(tagId) || tagId < 1) {
            continue;
        }

        tagIds.add(tagId);

        if (tagIds.size === MAX_POSTS_TAG_FILTERS) {
            break;
        }
    }

    return [...tagIds];
}

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
