/*============================================================================
  nav bookmarks - 书签数据操作

  封装书签与文件夹的不可变增删和拖拽插入，组件仅维护交互状态。
============================================================================*/

import type { NavBookmark, NavBookmarkFolder, NavBookmarkItem } from "@/types/nav";

export function isNavBookmarkFolder(bookmark: NavBookmark): bookmark is NavBookmarkFolder {
    return "children" in bookmark;
}

export function createNavBookmarkId(prefix: "bookmark" | "folder"): string {
    return `${prefix}-${crypto.randomUUID()}`;
}

/*== 目标不存在时追加到末尾，避免拖拽或编辑期间的旧引用阻断操作 ==*/
export function insertNavBookmarkAfter<TBookmark extends { id: string }>(bookmarks: TBookmark[], bookmark: TBookmark, afterId?: string): TBookmark[] {
    if (!afterId) return [...bookmarks, bookmark];

    const index = bookmarks.findIndex((item) => item.id === afterId);
    if (index === -1) return [...bookmarks, bookmark];

    return [...bookmarks.slice(0, index + 1), bookmark, ...bookmarks.slice(index + 1)];
}

/*== 在根级或一级文件夹内移除，并返回原对象供移动操作复用 ==*/
export function removeNavBookmark(bookmarks: NavBookmark[], id: string): { bookmarks: NavBookmark[]; removed: NavBookmark | null } {
    const rootIndex = bookmarks.findIndex((bookmark) => bookmark.id === id);
    if (rootIndex >= 0) {
        return { bookmarks: [...bookmarks.slice(0, rootIndex), ...bookmarks.slice(rootIndex + 1)], removed: bookmarks[rootIndex] };
    }

    for (const folder of bookmarks) {
        if (!isNavBookmarkFolder(folder)) continue;

        const childIndex = folder.children.findIndex((bookmark) => bookmark.id === id);
        if (childIndex < 0) continue;

        return {
            bookmarks: bookmarks.map((bookmark) =>
                bookmark.id === folder.id
                    ? { ...folder, children: [...folder.children.slice(0, childIndex), ...folder.children.slice(childIndex + 1)] }
                    : bookmark,
            ),
            removed: folder.children[childIndex],
        };
    }

    return { bookmarks, removed: null };
}

/*== 文件夹仅能接收书签；调用方负责禁止文件夹以 inside 方式插入 ==*/
export function insertNavBookmark(
    bookmarks: NavBookmark[],
    bookmark: NavBookmark,
    targetId: string,
    position: "after" | "before" | "inside",
    targetFolderId?: string,
): NavBookmark[] {
    if (position === "inside") {
        return bookmarks.map((item) =>
            isNavBookmarkFolder(item) && item.id === targetId ? { ...item, children: [...item.children, bookmark as NavBookmarkItem] } : item,
        );
    }

    if (!targetFolderId) {
        const targetIndex = bookmarks.findIndex((item) => item.id === targetId);
        if (targetIndex < 0) return [...bookmarks, bookmark];

        const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
        return [...bookmarks.slice(0, insertIndex), bookmark, ...bookmarks.slice(insertIndex)];
    }

    return bookmarks.map((item) => {
        if (!isNavBookmarkFolder(item) || item.id !== targetFolderId) return item;

        const targetIndex = item.children.findIndex((child) => child.id === targetId);
        if (targetIndex < 0) return { ...item, children: [...item.children, bookmark as NavBookmarkItem] };

        const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
        return { ...item, children: [...item.children.slice(0, insertIndex), bookmark as NavBookmarkItem, ...item.children.slice(insertIndex)] };
    });
}
