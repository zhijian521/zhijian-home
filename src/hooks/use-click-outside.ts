/*============================================================================
  use-click-outside - 外部交互关闭

  用于下拉菜单、文件夹浮层等轻量交互层，统一处理外部点击与 Escape 关闭。
============================================================================*/

"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

interface UseClickOutsideOptions {
    enabled?: boolean;
}

export function useClickOutside<TElement extends HTMLElement>(
    elementRef: RefObject<TElement | null>,
    onClose: () => void,
    { enabled = true }: UseClickOutsideOptions = {},
): void {
    useEffect(() => {
        if (!enabled) return;

        function handlePointerDown(event: PointerEvent) {
            if (!elementRef.current?.contains(event.target as Node)) onClose();
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [elementRef, enabled, onClose]);
}
