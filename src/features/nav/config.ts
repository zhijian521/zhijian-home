/*============================================================================
  nav - 导航页静态配置

  集中维护导航页首屏的搜索引擎和默认书签，后续接入交互时复用同一份数据。
============================================================================*/

import type { NavBookmark } from "@/types/nav";

/*== 书签内容与版本分开保存，版本用于识别不兼容的数据结构 ==*/
export const NAV_STORAGE_KEYS = {
    bookmarks: "zhijian_nav_bookmarks",
    bookmarksVersion: "zhijian_nav_bookmarks_version",
    searchEngine: "zhijian_nav_search_engine",
    searchHistory: "zhijian_nav_search_history",
} as const;

/*== 调整书签持久化结构时递增版本，使旧数据回退到默认书签 ==*/
export const NAV_BOOKMARKS_VERSION = 1;
export const NAV_SEARCH_HISTORY_LIMIT = 10;

/*== searchUrl 中的 {query} 由搜索栏替换为编码后的关键词 ==*/
export const NAV_SEARCH_ENGINES = [
    { key: "google", logo: "/images/engines/google.svg", name: "Google", searchUrl: "https://www.google.com/search?q={query}" },
    { key: "bing", logo: "/images/engines/bing.svg", name: "Bing", searchUrl: "https://www.bing.com/search?q={query}" },
    { key: "yahoo", logo: "/images/engines/yahoo.svg", name: "Yahoo", searchUrl: "https://search.yahoo.com/search?p={query}" },
    { key: "yandex", logo: "/images/engines/yandex.svg", name: "Yandex", searchUrl: "https://yandex.com/search/?text={query}" },
    { key: "duckduckgo", logo: "/images/engines/duckduckgo.svg", name: "DuckDuckGo", searchUrl: "https://duckduckgo.com/?q={query}" },
] as const;

export const NAV_DEFAULT_BOOKMARKS = [
    { id: "bm-github", name: "GitHub", url: "https://github.com" },
    { id: "bm-gmail", name: "Gmail", url: "https://mail.google.com" },
    { id: "bm-chatgpt", name: "ChatGPT", url: "https://chatgpt.com" },
    { id: "bm-claude", name: "Claude", url: "https://claude.ai" },
    {
        children: [
            { id: "bm-vercel", name: "Vercel", url: "https://vercel.com" },
            { id: "bm-mdn", name: "MDN", url: "https://developer.mozilla.org" },
            { id: "bm-stackoverflow", name: "Stack Overflow", url: "https://stackoverflow.com" },
        ],
        id: "bf-development",
        name: "开发",
    },
    {
        children: [
            { id: "bm-gemini", name: "Gemini", url: "https://gemini.google.com" },
            { id: "bm-coze", name: "Coze", url: "https://coze.com" },
        ],
        id: "bf-ai",
        name: "AI",
    },
    {
        children: [
            { id: "bm-figma", name: "Figma", url: "https://figma.com" },
            { id: "bm-stitch", name: "Stitch", url: "https://stitch.withgoogle.com" },
        ],
        id: "bf-design",
        name: "设计",
    },
    {
        children: [
            { id: "bm-x", name: "X", url: "https://x.com" },
            { id: "bm-instagram", name: "Instagram", url: "https://instagram.com" },
            { id: "bm-reddit", name: "Reddit", url: "https://reddit.com" },
            { id: "bm-weibo", name: "微博", url: "https://weibo.com" },
            { id: "bm-zhihu", name: "知乎", url: "https://zhihu.com" },
        ],
        id: "bf-social",
        name: "社交",
    },
    {
        children: [
            { id: "bm-douyin", name: "抖音", url: "https://douyin.com" },
            { id: "bm-youtube", name: "YouTube", url: "https://youtube.com" },
            { id: "bm-bilibili", name: "Bilibili", url: "https://bilibili.com" },
            { id: "bm-apple-music", name: "Apple Music", url: "https://music.apple.com" },
            { id: "bm-netease-music", name: "网易云音乐", url: "https://music.163.com" },
        ],
        id: "bf-media",
        name: "影音",
    },
] satisfies NavBookmark[];
