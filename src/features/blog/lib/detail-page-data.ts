/*== 在页面与 metadata 之间共享详情查询，并区分未找到和服务不可用 ==*/

import "server-only";

import { cache } from "react";

import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getPublishedPostBySlug } from "@/lib/domain/posts";
import type { PublishedPostDetail } from "@/types/post";

export type BlogPostDetailPageData =
    | { status: "available"; post: PublishedPostDetail }
    | { status: "not-found" }
    | { status: "unavailable" };

/*== React.cache 让 generateMetadata 与页面渲染在同一次请求内复用详情查询。 ==*/
export const getBlogPostDetailPageData = cache(async (slug: string): Promise<BlogPostDetailPageData> => {
    try {
        const post = await getPublishedPostBySlug(slug);

        return post ? { status: "available", post } : { status: "not-found" };
    } catch (error) {
        if (isServiceUnavailableError(error)) {
            console.error("博客详情不可用：", getErrorLogContext(error));
            return { status: "unavailable" };
        }

        throw error;
    }
});
