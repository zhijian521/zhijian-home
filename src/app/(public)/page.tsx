/*============================================================================
  home page - 首页

  公开路由首页，内容区块按首页迁移单元逐步接入。
============================================================================*/

import { HeroSection } from "@/components/home/hero-section";
import { PostsSection } from "@/components/home/posts-section";
import { ProfileSection } from "@/components/home/profile-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getLatestPosts } from "@/lib/domain/posts";
import type { PostPreview } from "@/types/post";

/*== 静态首页每 60 秒增量更新，避免公开请求直接触发数据库查询 ==*/
export const revalidate = 60;

export default async function HomePage() {
    const posts = await getLatestPostsForHome();

    return (
        <main>
            <HeroSection />
            <ProfileSection />
            <PostsSection posts={posts} />
            <ProjectsSection />
        </main>
    );
}

/*== 仅降级可预期的依赖异常；其余错误继续暴露给监控 ==*/
async function getLatestPostsForHome(): Promise<PostPreview[]> {
    try {
        return await getLatestPosts();
    } catch (error) {
        if (isServiceUnavailableError(error)) {
            console.error("首页最新文章不可用：", getErrorLogContext(error));
            return [];
        }

        throw error;
    }
}
