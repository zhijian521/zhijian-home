/*============================================================================
  post - 文章预览类型

  首页、文章列表与对应公开接口共用的最小数据结构。
============================================================================*/

export interface PostPreview {
    slug: string;
    title: string;
    summary: string | null;
    categoryName: string | null;
    publishedAt: string | null;
    updatedAt: string | null;
    coverImage: string | null;
    altText: string | null;
}

export interface PostFilterOption {
    name: string;
    slug: string;
}

export interface PublishedPostFilters {
    categories: PostFilterOption[];
    tags: PostFilterOption[];
}

export interface PublishedPostsPageQuery {
    categorySlug?: string;
    page?: number;
    pageSize?: number;
    tagSlugs?: string[];
}

export interface NormalizedPublishedPostsPageQuery {
    categorySlug?: string;
    page: number;
    pageSize: number;
    tagSlugs: string[];
}

export interface PublishedPostsPage {
    posts: PostPreview[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
