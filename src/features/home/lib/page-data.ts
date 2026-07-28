/*============================================================================
  home page data - 首页页面数据

  聚合首页服务端数据；后续新增数据源时在这里并行读取并按来源独立降级。
============================================================================*/

import "server-only";

import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getLatestPosts } from "@/lib/domain/posts";
import type { PostPreview } from "@/types/post";

interface HomePageData {
    posts: PostPreview[];
}

export async function getHomePageData(): Promise<HomePageData> {
    try {
        return { posts: await getLatestPosts() };
    } catch (error) {
        if (isServiceUnavailableError(error)) {
            console.error("首页最新文章不可用：", getErrorLogContext(error));
            return { posts: [] };
        }

        throw error;
    }
}
