/*============================================================================
  section-heading - 内容区块标题

  统一首页内容区块的标题、分割线与可选右侧操作。
============================================================================*/

import type { ReactNode } from "react";

import styles from "./section-heading.module.css";

interface SectionHeadingProps {
    children: ReactNode;
    action?: ReactNode;
    id?: string;
}

export function SectionHeading({ action, children, id }: SectionHeadingProps) {
    return (
        <div className={styles.root}>
            <h2 className={styles.title} id={id}>
                {children}
            </h2>
            <div aria-hidden="true" className={styles.line} />
            {action}
        </div>
    );
}
