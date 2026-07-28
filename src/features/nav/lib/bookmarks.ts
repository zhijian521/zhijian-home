/*============================================================================
  nav bookmarks - 书签数据操作

  封装书签与文件夹的不可变增删和拖拽插入，组件仅维护交互状态。
============================================================================*/

import type {
    NavBookmark,
    NavBookmarkEditorState,
    NavBookmarkEditorValues,
    NavBookmarkFolder,
    NavBookmarkItem,
} from "@/types/nav";

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

/*== 为键盘操作提供与拖拽一致的同级排序能力 ==*/
export function moveNavBookmarkByOffset(
    bookmarks: NavBookmark[],
    id: string,
    offset: -1 | 1,
    folderId?: string,
): NavBookmark[] {
    const siblings = folderId
        ? bookmarks.find((item): item is NavBookmarkFolder => isNavBookmarkFolder(item) && item.id === folderId)?.children
        : bookmarks;
    const sourceIndex = siblings?.findIndex((item) => item.id === id) ?? -1;
    const target = siblings?.[sourceIndex + offset];

    if (!target) return bookmarks;

    const { bookmarks: remainingBookmarks, removed } = removeNavBookmark(bookmarks, id);
    if (!removed) return bookmarks;

    return insertNavBookmark(remainingBookmarks, removed, target.id, offset < 0 ? "before" : "after", folderId);
}

export function moveNavBookmarkToFolder(bookmarks: NavBookmark[], id: string, folderId: string): NavBookmark[] {
    const targetFolder = bookmarks.find((item) => isNavBookmarkFolder(item) && item.id === folderId);
    if (!targetFolder) return bookmarks;

    const { bookmarks: remainingBookmarks, removed } = removeNavBookmark(bookmarks, id);
    if (!removed || isNavBookmarkFolder(removed)) return bookmarks;

    return insertNavBookmark(remainingBookmarks, removed, folderId, "inside");
}

export function moveNavBookmarkToRoot(bookmarks: NavBookmark[], id: string, folderId: string): NavBookmark[] {
    const sourceFolder = bookmarks.find((item): item is NavBookmarkFolder => isNavBookmarkFolder(item) && item.id === folderId);
    if (!sourceFolder?.children.some((item) => item.id === id)) return bookmarks;

    const { bookmarks: remainingBookmarks, removed } = removeNavBookmark(bookmarks, id);
    if (!removed) return bookmarks;

    return insertNavBookmarkAfter(remainingBookmarks, removed, folderId);
}

/*== 将编辑弹窗状态转换为下一份书签数据，组件只负责持久化结果 ==*/
export function applyNavBookmarkEdit(
    bookmarks: NavBookmark[],
    editorState: NavBookmarkEditorState,
    values: NavBookmarkEditorValues,
): NavBookmark[] {
    const name = values.name.trim();

    switch (editorState.type) {
        case "create-bookmark": {
            const bookmark: NavBookmarkItem = {
                id: createNavBookmarkId("bookmark"),
                name: name || "未命名",
                url: values.url,
            };

            if (!editorState.folderId) {
                return insertNavBookmarkAfter(bookmarks, bookmark, editorState.afterId);
            }

            return bookmarks.map((item) =>
                isNavBookmarkFolder(item) && item.id === editorState.folderId
                    ? { ...item, children: insertNavBookmarkAfter(item.children, bookmark, editorState.afterId) }
                    : item,
            );
        }
        case "create-folder": {
            const folder: NavBookmarkFolder = {
                children: [],
                id: createNavBookmarkId("folder"),
                name: name || "新文件夹",
            };

            return insertNavBookmarkAfter(bookmarks, folder, editorState.afterId);
        }
        case "edit-bookmark": {
            const nextBookmark = { ...editorState.bookmark, name: name || editorState.bookmark.name, url: values.url };

            if (!editorState.folderId) {
                return bookmarks.map((item) => (!isNavBookmarkFolder(item) && item.id === nextBookmark.id ? nextBookmark : item));
            }

            return bookmarks.map((item) =>
                isNavBookmarkFolder(item) && item.id === editorState.folderId
                    ? { ...item, children: item.children.map((child) => (child.id === nextBookmark.id ? nextBookmark : child)) }
                    : item,
            );
        }
        case "edit-folder":
            return bookmarks.map((item) =>
                isNavBookmarkFolder(item) && item.id === editorState.folder.id ? { ...item, name: name || item.name } : item,
            );
        case "delete":
            if (!editorState.folderId) {
                return bookmarks.filter((item) => item.id !== editorState.bookmark.id);
            }

            return bookmarks.map((item) =>
                isNavBookmarkFolder(item) && item.id === editorState.folderId
                    ? { ...item, children: item.children.filter((child) => child.id !== editorState.bookmark.id) }
                    : item,
            );
    }
}
