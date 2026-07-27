/*============================================================================
  button - 固定尺寸文字按钮

  使用链接语义承载当前站点的文本操作，统一图标、边框与 32px 高度。
============================================================================*/

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./button.module.css";

interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> {
    children: ReactNode;
    className?: string;
    href?: string;
    icon?: IconName;
    isActive?: boolean;
    isDisabled?: boolean;
}

export function Button({ children, className, href, icon, isActive = false, isDisabled = false, ...props }: ButtonProps) {
    const isUnavailable = isDisabled || !href;
    const rootClassName = clsx(styles.root, isActive && styles.active, isUnavailable && styles.disabled, className);
    const content = (
        <>
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
            {children}
        </>
    );

    if (isUnavailable) {
        return (
            <span aria-disabled="true" className={rootClassName}>
                {content}
            </span>
        );
    }

    const ariaCurrent = isActive ? "page" : props["aria-current"];

    if (href.startsWith("/") && !href.startsWith("//")) {
        return (
            <Link {...props} aria-current={ariaCurrent} className={rootClassName} href={href}>
                {content}
            </Link>
        );
    }

    return (
        <a {...props} aria-current={ariaCurrent} className={rootClassName} href={href}>
            {content}
        </a>
    );
}
