/*============================================================================
  input - 单行文本输入框

  为表单字段提供统一的单行输入样式，并保留原生 input 的完整语义与属性。
============================================================================*/

import clsx from "clsx";
import type { ComponentProps } from "react";

import styles from "./input.module.css";

export type InputProps = ComponentProps<"input">;

/*== 仅负责控件样式；标签、说明与错误提示由表单场景就近组合 ==*/
export function Input({ className, ...props }: InputProps) {
    return <input {...props} className={clsx(styles.root, className)} />;
}
