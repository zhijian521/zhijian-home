import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    applyNavBookmarkEdit,
    insertNavBookmark,
    insertNavBookmarkAfter,
    moveNavBookmarkByOffset,
    moveNavBookmarkToFolder,
    moveNavBookmarkToRoot,
    removeNavBookmark,
} from "../src/features/nav/lib/bookmarks.ts";
import { getNavHttpUrl } from "../src/features/nav/lib/urls.ts";
import type { NavBookmark, NavBookmarkFolder, NavBookmarkItem } from "../src/types/nav.ts";

const FIRST_BOOKMARK: NavBookmarkItem = { id: "first", name: "First", url: "https://first.example.com/" };
const FOLDER_BOOKMARK: NavBookmarkFolder = {
    children: [{ id: "child", name: "Child", url: "https://child.example.com/" }],
    id: "folder",
    name: "Folder",
};
const BOOKMARKS: NavBookmark[] = [FIRST_BOOKMARK, FOLDER_BOOKMARK];

describe("导航书签", () => {
    it("在指定书签后插入新书签", () => {
        const bookmark = { id: "second", name: "Second", url: "https://second.example.com/" };
        const result = insertNavBookmarkAfter(BOOKMARKS, bookmark, "first");

        assert.deepEqual(
            result.map((item) => item.id),
            ["first", "second", "folder"],
        );
        assert.deepEqual(BOOKMARKS.map((item) => item.id), ["first", "folder"]);
    });

    it("移除文件夹中的书签并返回被移除项", () => {
        const result = removeNavBookmark(BOOKMARKS, "child");

        assert.equal(result.removed?.id, "child");
        assert.deepEqual(result.bookmarks, [FIRST_BOOKMARK, { ...FOLDER_BOOKMARK, children: [] }]);
    });

    it("将根书签移动到文件夹内", () => {
        const { bookmarks, removed } = removeNavBookmark(BOOKMARKS, "first");
        assert.ok(removed);

        const result = insertNavBookmark(bookmarks, removed, "folder", "inside");
        assert.deepEqual(result, [{ ...FOLDER_BOOKMARK, children: [FOLDER_BOOKMARK.children[0], FIRST_BOOKMARK] }]);
    });

    it("根据编辑状态更新文件夹中的书签", () => {
        const child = FOLDER_BOOKMARK.children[0];
        const result = applyNavBookmarkEdit(
            BOOKMARKS,
            { bookmark: child, folderId: FOLDER_BOOKMARK.id, type: "edit-bookmark" },
            { name: "Updated", url: "https://updated.example.com/" },
        );

        assert.deepEqual(result, [
            FIRST_BOOKMARK,
            {
                ...FOLDER_BOOKMARK,
                children: [{ ...child, name: "Updated", url: "https://updated.example.com/" }],
            },
        ]);
    });

    it("通过键盘操作对应的数据方法调整书签位置", () => {
        const secondBookmark: NavBookmarkItem = { id: "second", name: "Second", url: "https://second.example.com/" };
        const rootBookmarks = [FIRST_BOOKMARK, secondBookmark, FOLDER_BOOKMARK];

        assert.deepEqual(moveNavBookmarkByOffset(rootBookmarks, "second", -1), [secondBookmark, FIRST_BOOKMARK, FOLDER_BOOKMARK]);

        const inFolder = moveNavBookmarkToFolder(rootBookmarks, "second", "folder");
        assert.deepEqual(inFolder, [FIRST_BOOKMARK, { ...FOLDER_BOOKMARK, children: [...FOLDER_BOOKMARK.children, secondBookmark] }]);
        assert.deepEqual(moveNavBookmarkToRoot(inFolder, "second", "folder"), [FIRST_BOOKMARK, FOLDER_BOOKMARK, secondBookmark]);
    });
});

describe("导航网址", () => {
    it("为 www 地址补全 HTTPS", () => {
        assert.equal(getNavHttpUrl("www.example.com"), "https://www.example.com/");
    });

    it("拒绝可执行协议和包含凭据的网址", () => {
        assert.equal(getNavHttpUrl("javascript:alert(1)"), null);
        assert.equal(getNavHttpUrl("https://user:password@example.com"), null);
    });
});
