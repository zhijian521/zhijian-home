/*============================================================================
  bookmark-item - 书签与文件夹条目

  渲染单个书签或文件夹，并将拖拽与菜单事件交由书签栏统一处理。
============================================================================*/

"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/ui/icons";
import { isNavBookmarkFolder } from "@/features/nav/lib/bookmarks";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { NavBookmark, NavBookmarkDragState } from "@/types/nav";

import { BookmarkFavicon } from "./bookmark-favicon";
import styles from "./bookmark-item.module.css";

const DRAG_CLASSES = {
    after: styles.dragAfter,
    before: styles.dragBefore,
    inside: styles.dragInside,
} as const;

interface BookmarkItemProps {
    bookmark: NavBookmark;
    dragState: NavBookmarkDragState | null;
    folderId?: string;
    onContextMenu: (event: React.MouseEvent, bookmark: NavBookmark, folderId?: string) => void;
    onDragEnd: () => void;
    onDragOver: (event: React.DragEvent, bookmark: NavBookmark, folderId?: string) => void;
    onDragStart: (event: React.DragEvent, bookmark: NavBookmark, folderId?: string) => void;
    onDrop: (event: React.DragEvent, bookmark: NavBookmark, folderId?: string) => void;
}

export function BookmarkItem({ bookmark, dragState, folderId, onContextMenu, onDragEnd, onDragOver, onDragStart, onDrop }: BookmarkItemProps) {
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const folderRef = useRef<HTMLDivElement>(null);

    /*== 仅当前悬停目标展示拖拽位置，避免多个条目同时出现状态标记 ==*/
    const dragPosition = dragState?.overId === bookmark.id ? dragState.position : null;
    const dragClassName = dragPosition ? DRAG_CLASSES[dragPosition] : undefined;

    /*== 文件夹展开时才监听外部交互，普通书签不注册全局事件 ==*/
    useClickOutside(folderRef, () => setIsFolderOpen(false), { enabled: isFolderOpen });

    if (isNavBookmarkFolder(bookmark)) {
        return (
            <div
                className={styles.folder}
                draggable
                onContextMenu={(event) => onContextMenu(event, bookmark)}
                onDragEnd={onDragEnd}
                onDragOver={(event) => onDragOver(event, bookmark)}
                onDragStart={(event) => onDragStart(event, bookmark)}
                onDrop={(event) => onDrop(event, bookmark)}
                ref={folderRef}
            >
                <button
                    aria-expanded={isFolderOpen}
                    className={`${styles.item} ${dragClassName ?? ""}`}
                    onClick={() => setIsFolderOpen((value) => !value)}
                    type="button"
                >
                    <Icon className={styles.folderIcon} name="folder" />
                    <span className={styles.name}>{bookmark.name}</span>
                    <Icon className={styles.chevron} name="chevron-down" />
                </button>
                {isFolderOpen ? (
                    <div aria-label={bookmark.name} className={styles.popup}>
                        {bookmark.children.map((child) => {
                            /*== 子书签不支持嵌套，inside 状态不应作为子书签的视觉反馈 ==*/
                            const childDragPosition = dragState?.overId === child.id ? dragState.position : null;
                            const childDragClassName =
                                childDragPosition && childDragPosition !== "inside" ? DRAG_CLASSES[childDragPosition] : undefined;

                            /*== 子书签的拖拽事件必须止于自身，防止父文件夹成为实际拖拽目标 ==*/
                            return (
                                <a
                                    className={`${styles.popupItem} ${childDragClassName ?? ""}`}
                                    draggable
                                    href={child.url}
                                    key={child.id}
                                    onContextMenu={(event) => onContextMenu(event, child, bookmark.id)}
                                    onDragEnd={(event) => {
                                        event.stopPropagation();
                                        onDragEnd();
                                    }}
                                    onDragOver={(event) => {
                                        event.stopPropagation();
                                        onDragOver(event, child, bookmark.id);
                                    }}
                                    onDragStart={(event) => {
                                        event.stopPropagation();
                                        onDragStart(event, child, bookmark.id);
                                    }}
                                    onDrop={(event) => {
                                        event.stopPropagation();
                                        onDrop(event, child, bookmark.id);
                                    }}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <BookmarkFavicon fallback={child.name.slice(0, 1)} url={child.url} />
                                    <span className={styles.name}>{child.name}</span>
                                </a>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <a
            className={`${styles.item} ${dragClassName ?? ""}`}
            draggable
            href={bookmark.url}
            onContextMenu={(event) => onContextMenu(event, bookmark, folderId)}
            onDragEnd={onDragEnd}
            onDragOver={(event) => onDragOver(event, bookmark, folderId)}
            onDragStart={(event) => onDragStart(event, bookmark, folderId)}
            onDrop={(event) => onDrop(event, bookmark, folderId)}
            rel="noopener noreferrer"
            target="_blank"
        >
            <BookmarkFavicon fallback={bookmark.name.slice(0, 1)} url={bookmark.url} />
            <span className={styles.name}>{bookmark.name}</span>
        </a>
    );
}
