/*============================================================================
  nav storage - 导航页本地存储

  本地存储不可用时自动降级为内存状态，不能影响搜索和书签的当次使用。
============================================================================*/

import { NAV_BOOKMARKS_VERSION, NAV_DEFAULT_BOOKMARKS, NAV_SEARCH_ENGINES, NAV_SEARCH_HISTORY_LIMIT, NAV_STORAGE_KEYS } from "@/features/nav/config";
import { isNavBookmarkFolder } from "@/features/nav/lib/bookmarks";
import { getNavHttpUrl } from "@/features/nav/lib/urls";
import type { NavBookmark, NavSearchHistoryItem } from "@/types/nav";

/*== 默认配置是共享常量，交给界面使用前必须克隆 ==*/
function getDefaultBookmarks(): NavBookmark[] {
    return structuredClone(NAV_DEFAULT_BOOKMARKS);
}

/*== localStorage 可被旧版本或用户直接修改，只接受当前支持的一层书签结构 ==*/
function isBookmarkItem(value: unknown): value is NavBookmark {
    if (!value || typeof value !== "object") return false;

    const bookmark = value as Record<string, unknown>;
    if (typeof bookmark.id !== "string" || typeof bookmark.name !== "string") return false;
    if ("children" in bookmark) {
        return (
            Array.isArray(bookmark.children) &&
            bookmark.children.every(isBookmarkItem) &&
            bookmark.children.every((item) => !isNavBookmarkFolder(item))
        );
    }

    return typeof bookmark.url === "string" && Boolean(getNavHttpUrl(bookmark.url));
}

function getStorage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function readStorage<TValue>(key: string): TValue | null {
    const storage = getStorage();
    if (!storage) return null;

    try {
        const value = storage.getItem(key);
        return value ? (JSON.parse(value) as TValue) : null;
    } catch {
        return null;
    }
}

function readStorageValue(key: string): string | null {
    const storage = getStorage();
    if (!storage) return null;

    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: unknown): void {
    const storage = getStorage();
    if (!storage) return;

    try {
        storage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
}

function writeStorageValue(key: string, value: string): void {
    const storage = getStorage();
    if (!storage) return;

    try {
        storage.setItem(key, value);
    } catch {
        return;
    }
}

function removeStorageValue(key: string): void {
    const storage = getStorage();
    if (!storage) return;

    try {
        storage.removeItem(key);
    } catch {
        return;
    }
}

export function getNavBookmarks(): NavBookmark[] {
    const bookmarks = readStorage<unknown>(NAV_STORAGE_KEYS.bookmarks);
    const savedVersion = readStorageValue(NAV_STORAGE_KEYS.bookmarksVersion);

    if (savedVersion === String(NAV_BOOKMARKS_VERSION) && Array.isArray(bookmarks) && bookmarks.every(isBookmarkItem)) {
        return bookmarks;
    }

    /*== 版本失配或数据损坏时回退默认值，并在存储可用时同步修复 ==*/
    const defaultBookmarks = getDefaultBookmarks();
    saveNavBookmarks(defaultBookmarks);
    return defaultBookmarks;
}

export function saveNavBookmarks(bookmarks: NavBookmark[]): void {
    writeStorage(NAV_STORAGE_KEYS.bookmarks, bookmarks);
    writeStorageValue(NAV_STORAGE_KEYS.bookmarksVersion, String(NAV_BOOKMARKS_VERSION));
}

export function getNavSearchEngine(): string {
    const engineKey = readStorageValue(NAV_STORAGE_KEYS.searchEngine);
    /*== 已移除或无效的搜索引擎统一回退首个可用配置 ==*/
    return engineKey && NAV_SEARCH_ENGINES.some((engine) => engine.key === engineKey) ? engineKey : NAV_SEARCH_ENGINES[0].key;
}

export function saveNavSearchEngine(engineKey: string): void {
    writeStorageValue(NAV_STORAGE_KEYS.searchEngine, engineKey);
}

export function getNavSearchHistory(): NavSearchHistoryItem[] {
    const history = readStorage<unknown>(NAV_STORAGE_KEYS.searchHistory);
    if (!Array.isArray(history)) return [];

    /*== 忽略损坏项并限制数量，避免异常存储拖慢整个搜索面板 ==*/
    return history
        .filter(
            (item): item is NavSearchHistoryItem =>
                Boolean(item) &&
                typeof item === "object" &&
                typeof (item as NavSearchHistoryItem).id === "string" &&
                typeof (item as NavSearchHistoryItem).query === "string" &&
                typeof (item as NavSearchHistoryItem).engineKey === "string" &&
                typeof (item as NavSearchHistoryItem).timestamp === "number",
        )
        .slice(0, NAV_SEARCH_HISTORY_LIMIT);
}

export function saveNavSearchHistory(history: NavSearchHistoryItem[]): void {
    writeStorage(NAV_STORAGE_KEYS.searchHistory, history.slice(0, NAV_SEARCH_HISTORY_LIMIT));
}

export function clearNavSearchHistory(): void {
    removeStorageValue(NAV_STORAGE_KEYS.searchHistory);
}
