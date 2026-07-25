/*============================================================================
  post - 文章展示类型

  首页最新文章与对应公开接口共用的最小数据结构。
============================================================================*/

export interface LatestPost {
    slug: string;
    title: string;
    summary: string | null;
    categoryName: string | null;
    publishedAt: string | null;
    updatedAt: string | null;
    coverImage: string | null;
    altText: string | null;
}
