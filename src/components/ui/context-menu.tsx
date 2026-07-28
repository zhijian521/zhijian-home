/*============================================================================
  context-menu - 右键操作菜单

  使用 roving tabindex 提供标准菜单键盘导航，并在 Escape 关闭时恢复触发元素焦点。
============================================================================*/

"use client";

import clsx from "clsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";

import styles from "./context-menu.module.css";

export interface ContextMenuAction {
    id: string;
    label: string;
    onSelect: () => void;
    danger?: boolean;
    disabled?: boolean;
    restoreFocus?: boolean;
}

export interface ContextMenuPosition {
    x: number;
    y: number;
}

interface ContextMenuProps {
    actions: readonly ContextMenuAction[];
    onClose: (shouldRestoreFocus?: boolean) => void;
    position: ContextMenuPosition;
}

function getFirstEnabledActionIndex(actions: readonly ContextMenuAction[]): number {
    return actions.findIndex((action) => !action.disabled);
}

/*== 调用方仅提供菜单项和触发坐标，组件负责焦点、键盘导航与视口边界 ==*/
export function ContextMenu({ actions, onClose, position }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [menuPosition, setMenuPosition] = useState(position);
    const [activeIndex, setActiveIndex] = useState(() => getFirstEnabledActionIndex(actions));

    useClickOutside(menuRef, () => onClose());

    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;

        const viewportInset = 8;
        const { height, width } = menu.getBoundingClientRect();
        setMenuPosition({
            x: Math.max(viewportInset, Math.min(position.x, window.innerWidth - width - viewportInset)),
            y: Math.max(viewportInset, Math.min(position.y, window.innerHeight - height - viewportInset)),
        });
    }, [actions, position]);

    useEffect(() => {
        itemRefs.current[activeIndex]?.focus();
    }, [activeIndex]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose(true);
            return;
        }

        const enabledIndices = actions.flatMap((action, index) => (action.disabled ? [] : index));
        if (!enabledIndices.length) return;

        let nextIndex: number | null = null;
        const currentEnabledIndex = Math.max(enabledIndices.indexOf(activeIndex), 0);

        if (event.key === "Home") nextIndex = enabledIndices[0];
        if (event.key === "End") nextIndex = enabledIndices.at(-1) ?? null;
        if (event.key === "ArrowDown") nextIndex = enabledIndices[(currentEnabledIndex + 1) % enabledIndices.length];
        if (event.key === "ArrowUp") nextIndex = enabledIndices[(currentEnabledIndex - 1 + enabledIndices.length) % enabledIndices.length];
        if (nextIndex === null) return;

        event.preventDefault();
        setActiveIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
    }

    function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
        if (event.relatedTarget instanceof Node && menuRef.current?.contains(event.relatedTarget)) return;

        onClose();
    }

    function handleSelect(action: ContextMenuAction) {
        if (action.disabled) return;

        action.onSelect();
        onClose(action.restoreFocus);
    }

    return (
        <div
            aria-label="操作菜单"
            className={styles.root}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            ref={menuRef}
            role="menu"
            style={{ left: menuPosition.x, top: menuPosition.y }}
        >
            {actions.map((action, index) => (
                <button
                    className={clsx(styles.item, action.danger && styles.danger)}
                    disabled={action.disabled}
                    key={action.id}
                    onClick={() => handleSelect(action)}
                    onFocus={() => setActiveIndex(index)}
                    ref={(element) => {
                        itemRefs.current[index] = element;
                    }}
                    role="menuitem"
                    tabIndex={action.disabled ? -1 : activeIndex === index ? 0 : -1}
                    type="button"
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
