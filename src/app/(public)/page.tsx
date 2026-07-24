/*============================================================================
  home page - 首页

  公开路由首页，内容区块按首页迁移单元逐步接入。
============================================================================*/

import { AboutSection } from "@/components/home/about-section";
import { HeroSection } from "@/components/home/hero-section";

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <AboutSection />
        </main>
    );
}
