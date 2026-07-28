/*============================================================================
  bookmark-bar - 导航页书签栏

  维护书签本地状态、右键操作和拖拽排序；编辑通过统一弹窗完成。
============================================================================*/

"use client";

import { useEffect, useRef, useState } from "react";

import { ContextMenu } from "@/components/ui/context-menu";
import { IconButton } from "@/components/ui/icon-button";
import { NAV_DEFAULT_BOOKMARKS } from "@/features/nav/config";
import {
    applyNavBookmarkEdit,
    insertNavBookmark,
    isNavBookmarkFolder,
    moveNavBookmarkByOffset,
    moveNavBookmarkToFolder,
    moveNavBookmarkToRoot,
    removeNavBookmark,
} from "@/features/nav/lib/bookmarks";
import { getNavBookmarks, saveNavBookmarks } from "@/features/nav/lib/storage";
import type { ContextMenuAction, ContextMenuPosition } from "@/components/ui/context-menu";
import type { NavBookmark, NavBookmarkDragState, NavBookmarkEditorState, NavBookmarkEditorValues, NavBookmarkFolder } from "@/types/nav";

import { BookmarkDialog } from "./bookmark-dialog";
import { BookmarkItem } from "./bookmark-item";
import styles from "./bookmark-bar.module.css";

interface ContextMenuState {
    bookmark?: NavBookmark;
    folderId?: string;
    position: ContextMenuPosition;
}

const MANAGE_BOOKMARKS_ID = "nav-manage-bookmarks";

function getInitialBookmarks(): NavBookmark[] {
    return structuredClone(NAV_DEFAULT_BOOKMARKS);
}

export function BookmarkBar() {
    const [bookmarks, setBookmarks] = useState<NavBookmark[]>(getInitialBookmarks);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [dragState, setDragState] = useState<NavBookmarkDragState | null>(null);
    const [editorState, setEditorState] = useState<NavBookmarkEditorState | null>(null);
    const dragStateRef = useRef<NavBookmarkDragState | null>(null);
    const contextMenuTriggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setBookmarks(getNavBookmarks()));
        return () => cancelAnimationFrame(frame);
    }, []);

    function updateDragState(nextDragState: NavBookmarkDragState | null) {
        dragStateRef.current = nextDragState;
        setDragState(nextDragState);
    }

    function persist(nextBookmarks: NavBookmark[]) {
        setBookmarks(nextBookmarks);
        saveNavBookmarks(nextBookmarks);
    }

    function handleContextMenu(event: React.MouseEvent, bookmark?: NavBookmark, folderId?: string) {
        event.preventDefault();
        event.stopPropagation();

        const interactiveTarget = event.target instanceof HTMLElement ? event.target.closest("a, button") : null;
        const trigger = interactiveTarget instanceof HTMLElement ? interactiveTarget : (event.currentTarget as HTMLElement);
        const { bottom, left } = trigger.getBoundingClientRect();
        contextMenuTriggerRef.current = trigger;
        setContextMenu({
            bookmark,
            folderId,
            position: event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : { x: left, y: bottom },
        });
    }

    function handleManageBookmarks(event: React.MouseEvent<HTMLButtonElement>) {
        const { bottom, right } = event.currentTarget.getBoundingClientRect();
        contextMenuTriggerRef.current = event.currentTarget;
        setContextMenu({ position: { x: right, y: bottom } });
    }

    function restoreContextMenuTrigger() {
        requestAnimationFrame(() => {
            const trigger = contextMenuTriggerRef.current;
            (trigger?.isConnected ? trigger : document.getElementById(MANAGE_BOOKMARKS_ID))?.focus();
        });
    }

    function closeContextMenu(shouldRestoreFocus = false) {
        setContextMenu(null);

        if (shouldRestoreFocus) {
            restoreContextMenuTrigger();
        }
    }

    function closeEditor() {
        setEditorState(null);
        restoreContextMenuTrigger();
    }

    function handleDragStart(event: React.DragEvent, bookmark: NavBookmark, folderId?: string) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", bookmark.id);
        updateDragState({ folderId, id: bookmark.id, overId: null, position: null });
    }

    function handleDragOver(event: React.DragEvent, bookmark: NavBookmark, folderId?: string) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        const { left, right, width } = event.currentTarget.getBoundingClientRect();
        const isFolder = isNavBookmarkFolder(bookmark);
        const edge = width * (isFolder ? 0.25 : 0.5);
        const position =
            isFolder && event.clientX >= left + edge && event.clientX <= right - edge
                ? "inside"
                : event.clientX < left + width / 2
                  ? "before"
                  : "after";

        const currentDragState = dragStateRef.current;
        if (!currentDragState) return;

        updateDragState({ ...currentDragState, overId: bookmark.id, position: folderId && position === "inside" ? "after" : position });
    }

    function handleDrop(event: React.DragEvent, target: NavBookmark, targetFolderId?: string) {
        event.preventDefault();

        const currentDragState = dragStateRef.current;
        if (!currentDragState || !currentDragState.position || currentDragState.id === target.id) return;

        const { bookmarks: remainingBookmarks, removed } = removeNavBookmark(bookmarks, currentDragState.id);
        if (!removed) return;

        if (isNavBookmarkFolder(removed) && (currentDragState.position === "inside" || targetFolderId)) {
            updateDragState(null);
            return;
        }

        persist(insertNavBookmark(remainingBookmarks, removed, target.id, currentDragState.position, targetFolderId));
        updateDragState(null);
    }

    function handleSaveEditor(values: NavBookmarkEditorValues) {
        if (!editorState) return;

        persist(applyNavBookmarkEdit(bookmarks, editorState, values));
        closeEditor();
    }

    function getContextMenuActions(): ContextMenuAction[] {
        if (!contextMenu?.bookmark) {
            return [
                { id: "create-bookmark", label: "新增书签", onSelect: () => setEditorState({ type: "create-bookmark" }) },
                { id: "create-folder", label: "新增文件夹", onSelect: () => setEditorState({ type: "create-folder" }) },
            ];
        }

        const { bookmark, folderId } = contextMenu;
        const moveActions = getMoveActions(bookmark, folderId);

        if (isNavBookmarkFolder(bookmark)) {
            return [
                { id: "edit", label: "编辑", onSelect: () => setEditorState({ folder: bookmark, type: "edit-folder" }) },
                ...moveActions,
                { danger: true, id: "delete", label: "删除", onSelect: () => setEditorState({ bookmark, type: "delete" }) },
                { id: "create-bookmark", label: "新增书签", onSelect: () => setEditorState({ afterId: bookmark.id, type: "create-bookmark" }) },
                { id: "create-folder", label: "新增文件夹", onSelect: () => setEditorState({ afterId: bookmark.id, type: "create-folder" }) },
                {
                    id: "create-child-bookmark",
                    label: "新增下级书签",
                    onSelect: () => setEditorState({ folderId: bookmark.id, type: "create-bookmark" }),
                },
            ];
        }

        return [
            { id: "edit", label: "编辑", onSelect: () => setEditorState({ bookmark, folderId, type: "edit-bookmark" }) },
            ...moveActions,
            { danger: true, id: "delete", label: "删除", onSelect: () => setEditorState({ bookmark, folderId, type: "delete" }) },
            { id: "create-bookmark", label: "新增书签", onSelect: () => setEditorState({ afterId: bookmark.id, folderId, type: "create-bookmark" }) },
            { id: "create-folder", label: "新增文件夹", onSelect: () => setEditorState({ afterId: bookmark.id, type: "create-folder" }) },
        ];
    }

    function getMoveActions(bookmark: NavBookmark, folderId?: string): ContextMenuAction[] {
        const siblings = folderId
            ? bookmarks.find((item): item is NavBookmarkFolder => isNavBookmarkFolder(item) && item.id === folderId)?.children
            : bookmarks;
        const index = siblings?.findIndex((item) => item.id === bookmark.id) ?? -1;
        const actions: ContextMenuAction[] = [
            {
                disabled: index <= 0,
                id: "move-before",
                label: "向前移动",
                onSelect: () => persist(moveNavBookmarkByOffset(bookmarks, bookmark.id, -1, folderId)),
                restoreFocus: true,
            },
            {
                disabled: index < 0 || index >= (siblings?.length ?? 0) - 1,
                id: "move-after",
                label: "向后移动",
                onSelect: () => persist(moveNavBookmarkByOffset(bookmarks, bookmark.id, 1, folderId)),
                restoreFocus: true,
            },
        ];

        if (folderId) {
            actions.push({
                id: "move-to-root",
                label: "移出文件夹",
                onSelect: () => persist(moveNavBookmarkToRoot(bookmarks, bookmark.id, folderId)),
                restoreFocus: true,
            });
        } else if (!isNavBookmarkFolder(bookmark)) {
            bookmarks.forEach((item) => {
                if (!isNavBookmarkFolder(item)) return;

                actions.push({
                    id: `move-to-${item.id}`,
                    label: `移入“${item.name}”`,
                    onSelect: () => persist(moveNavBookmarkToFolder(bookmarks, bookmark.id, item.id)),
                    restoreFocus: true,
                });
            });
        }

        return actions;
    }

    return (
        <div className={styles.root} onContextMenu={(event) => handleContextMenu(event)}>
            <div className={styles.bar}>
                {bookmarks.map((bookmark) => (
                    <BookmarkItem
                        bookmark={bookmark}
                        dragState={dragState}
                        key={bookmark.id}
                        onContextMenu={handleContextMenu}
                        onDragEnd={() => updateDragState(null)}
                        onDragOver={handleDragOver}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                    />
                ))}
                <IconButton asButton icon="more-horizontal" id={MANAGE_BOOKMARKS_ID} label="管理书签" onClick={handleManageBookmarks} />
            </div>

            {contextMenu ? <ContextMenu actions={getContextMenuActions()} onClose={closeContextMenu} position={contextMenu.position} /> : null}
            {editorState ? (
                <BookmarkDialog
                    editorState={editorState}
                    key={editorState.type === "delete" ? editorState.bookmark.id : editorState.type}
                    onClose={closeEditor}
                    onSubmit={handleSaveEditor}
                />
            ) : null}
        </div>
    );
}
