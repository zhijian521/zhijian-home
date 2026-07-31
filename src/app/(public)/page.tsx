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

/*== 静态首页 ==*/
export default async function HomePage() {
    const { posts } = await getHomePageData();

    return (
        <main>
            {/*== 结构化数据 ==*/}
            <script dangerouslySetInnerHTML={{ __html: HOME_JSON_LD }} type="application/ld+json" />

            {/*== 首屏展示 ==*/}
            <HeroSection />

            {/*== 个人信息 ==*/}
            <ProfileSection />

            {/*== 最新文章 ==*/}
            <PostsSection posts={posts} />

            {/*== 开源项目 ==*/}
            <ProjectsSection />
        </main>
    );
}
