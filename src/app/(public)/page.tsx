/*============================================================================
  home page - 首页

  公开路由首页，内容区块按首页迁移单元逐步接入。
============================================================================*/

import { HeroSection } from "@/components/home/hero-section";
import { ProfileSection } from "@/components/home/profile-section";
import { ProjectsSection } from "@/components/home/projects-section";

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <ProfileSection />
            <ProjectsSection />
        </main>
    );
}
