/*============================================================================
  status-section - 页面状态区块

  统一空状态与不可用状态的标题、说明和可选操作展示。
============================================================================*/

import clsx from "clsx";
import { useId } from "react";
import type { ReactNode } from "react";

import styles from "./status-section.module.css";

interface StatusSectionProps {
    align?: "start" | "center";
    children?: ReactNode;
    description: string;
    title: string;
    titleAs?: "h1" | "h2";
}

export function StatusSection({ align = "start", children, description, title, titleAs: Title = "h2" }: StatusSectionProps) {
    const titleId = useId();

    return (
        <section aria-labelledby={titleId} className={clsx(styles.root, align === "center" && styles.center)}>
            <Title className={styles.title} id={titleId}>
                {title}
            </Title>
            <p className={styles.description}>{description}</p>
            {children ? <div className={styles.action}>{children}</div> : null}
        </section>
    );
}
