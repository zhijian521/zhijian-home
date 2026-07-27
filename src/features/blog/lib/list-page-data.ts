/*============================================================================
  blog list page data - 博客列表页面数据

  读取列表页所需的筛选项与分页文章，并在同一次服务端请求中共享结果。
============================================================================*/

import "server-only";

import { cache } from "react";

import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getPublishedPostFilters } from "@/lib/domain/post-filters";
import { getPublishedPostsPage } from "@/lib/domain/posts";
import type { NormalizedPublishedPostsPageQuery, PublishedPostFilters, PublishedPostsPage } from "@/types/post";

import { getTagSlugs, resolveBlogFilterState, type BlogFilterState } from "./filters";

interface BlogListPageData {
    filterOptions: PublishedPostFilters;
    filters: BlogFilterState;
    pageData: PublishedPostsPage;
}

/*== 对外接收规范化查询；内部改用基础类型缓存键，使 metadata 与页面的独立调用可在同一请求内去重 ==*/
export function getBlogListPageData(query: NormalizedPublishedPostsPageQuery): Promise<BlogListPageData | null> {
    return getCachedBlogListPageData(query.page, query.categorySlug ?? "", query.tagSlugs.join(","));
}

const getCachedBlogListPageData = cache(
    async (page: number, requestedCategorySlug: string, requestedTagSlugsValue: string): Promise<BlogListPageData | null> => {
        try {
            const filterOptions = await getPublishedPostFilters();
            const filters = resolveBlogFilterState(
                {
                    categorySlug: requestedCategorySlug || undefined,
                    tagSlugs: requestedTagSlugsValue ? requestedTagSlugsValue.split(",") : [],
                },
                filterOptions,
            );
            const pageData = await getPublishedPostsPage({
                categorySlug: filters.category?.slug,
                page,
                tagSlugs: getTagSlugs(filters),
            });

            return { filterOptions, filters, pageData };
        } catch (error) {
            if (isServiceUnavailableError(error)) {
                console.error("博客列表文章或筛选项不可用：", getErrorLogContext(error));
                return null;
            }

            throw error;
        }
    },
);
