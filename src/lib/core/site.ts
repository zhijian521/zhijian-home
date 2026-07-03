/*============================================================================
  site — 站点元数据与配置

  集中管理站点名、URL、描述等静态配置。env 优先,缺省给本地默认值。
============================================================================*/

export const SITE_METADATA = {
    title: '知简',
    brandTitle: '知简',
    description: '个人博客 · 导航 · 后台',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    locale: 'zh_CN',
} as const;
