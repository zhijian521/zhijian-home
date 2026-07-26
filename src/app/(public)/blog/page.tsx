/*============================================================================
  blog page - 文章列表页

  暂时只建立公开路由边界，列表内容将在后续迁移步骤中接入。
============================================================================*/

import type { Metadata } from "next";

/*== 占位路由不参与索引，博客列表完成后由 BL-001 替换正式元数据 ==*/
export const metadata: Metadata = {
    title: "文章",
    description: "文章列表正在迁移中。",
    robots: {
        index: false,
        follow: false,
        noarchive: true,
    },
};

export default function BlogPage() {
    return <main />;
}
