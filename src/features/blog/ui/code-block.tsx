"use client";

/*== 公开详情页与后台预览共用代码展示和复制操作 ==*/

import clsx from "clsx";
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { Icon } from "@/components/ui/icons";

import styles from "./code-block.module.css";

const COPY_FEEDBACK_DURATION = 1_500;

interface CodeBlockProps extends ComponentPropsWithoutRef<"pre"> {
    node?: unknown;
}

function extractText(children: ReactNode): string {
    if (typeof children === "string") {
        return children;
    }

    if (Array.isArray(children)) {
        return children.map(extractText).join("");
    }

    if (children && typeof children === "object" && "props" in children) {
        return extractText((children as { props: { children: ReactNode } }).props.children);
    }

    return "";
}

export function CodeBlock({ children, className, node: _node, ...props }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);
    const resetTimer = useRef<number | undefined>(undefined);
    const code = extractText(children);

    useEffect(() => {
        return () => {
            if (resetTimer.current !== undefined) {
                window.clearTimeout(resetTimer.current);
            }
        };
    }, []);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);

            if (resetTimer.current !== undefined) {
                window.clearTimeout(resetTimer.current);
            }

            resetTimer.current = window.setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION);
        } catch {
            setIsCopied(false);
        }
    }

    return (
        <div className={styles.root}>
            <button aria-label={isCopied ? "已复制代码" : "复制代码"} className={styles.copy} onClick={() => void handleCopy()} title="复制代码" type="button">
                <Icon name={isCopied ? "check" : "copy"} size="0.75rem" />
            </button>
            <pre {...props} className={clsx(styles.area, className)}>
                {children}
            </pre>
        </div>
    );
}
