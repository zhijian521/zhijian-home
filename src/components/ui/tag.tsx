/*============================================================================
  tag - 固定尺寸标签

  为技术栈、文章分类等短文本提供统一的 28px 标签样式。
============================================================================*/

import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./tag.module.css";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "primary";
}

export function Tag({ className, variant = "default", ...props }: TagProps) {
    return <span className={clsx(styles.root, styles[variant], className)} {...props} />;
}
