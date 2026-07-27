/*============================================================================
  text-button - 文字操作

  有 href 时输出链接；卡片内可作为外层链接的装饰性操作提示使用。
============================================================================*/

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./text-button.module.css";

interface TextButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
    children: ReactNode;
    href?: string;
    icon?: IconName;
}

export function TextButton({ children, className, href, icon, ...props }: TextButtonProps) {
    const rootClassName = clsx(styles.root, className);
    const content = (
        <>
            {children}
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
        </>
    );

    if (href) {
        if (href.startsWith("/") && !href.startsWith("//")) {
            return (
                <Link className={rootClassName} href={href} {...props}>
                    {content}
                </Link>
            );
        }

        return (
            <a className={rootClassName} href={href} {...props}>
                {content}
            </a>
        );
    }

    return <span className={rootClassName}>{content}</span>;
}
