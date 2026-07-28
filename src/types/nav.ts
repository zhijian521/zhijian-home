/*============================================================================
  nav - 导航页数据类型

  仅描述导航页在浏览器中维护的搜索与书签数据，不包含登录或服务端同步状态。
============================================================================*/

export interface NavSearchHistoryItem {
    engineKey: string;
    id: string;
    query: string;
    timestamp: number;
}

export interface NavBookmarkItem {
    id: string;
    name: string;
    url: string;
}

/*== 当前仅支持一级文件夹，避免书签栏出现递归层级 ==*/
export interface NavBookmarkFolder {
    children: NavBookmarkItem[];
    id: string;
    name: string;
}

export type NavBookmark = NavBookmarkItem | NavBookmarkFolder;

/*== 拖拽状态只描述目标位置，不包含书签数据本身 ==*/
export interface NavBookmarkDragState {
    folderId?: string;
    id: string;
    overId: string | null;
    position: "after" | "before" | "inside" | null;
}

export interface NavBookmarkEditorValues {
    name: string;
    url: string;
}

export type NavBookmarkEditorState =
    | { type: "create-bookmark"; afterId?: string; folderId?: string }
    | { type: "create-folder"; afterId?: string }
    | { type: "edit-bookmark"; bookmark: NavBookmarkItem; folderId?: string }
    | { type: "edit-folder"; folder: NavBookmarkFolder }
    | { type: "delete"; bookmark: NavBookmark; folderId?: string };
