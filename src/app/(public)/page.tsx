/*============================================================================
  home page - 首页

  公开路由首页，内容区块按首页迁移单元逐步接入。
============================================================================*/

import type { Metadata } from "next";

import { HOME_JSON_LD, HOME_METADATA } from "@/features/home/lib/metadata";
import { getHomePageData } from "@/features/home/lib/page-data";
import { HeroSection } from "@/features/home/ui/hero-section";
import { PostsSection } from "@/features/home/ui/posts-section";
import { ProfileSection } from "@/features/home/ui/profile-section";
import { ProjectsSection } from "@/features/home/ui/projects-section";

export const metadata: Metadata = HOME_METADATA;

/*== 静态首页每 60 秒增量更新，避免公开请求直接触发数据库查询 ==*/
export const revalidate = 60;

export default async function HomePage() {
    const { posts } = await getHomePageData();

    return (
        <main>
            {/*== JSON-LD 仅使用本地配置，序列化时已转义危险字符 ==*/}
            <script dangerouslySetInnerHTML={{ __html: HOME_JSON_LD }} type="application/ld+json" />
            <HeroSection />
            <ProfileSection />
            <PostsSection posts={posts} />
            <ProjectsSection />
        </main>
    );
}
