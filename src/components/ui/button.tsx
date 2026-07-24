/*============================================================================
  button - 固定尺寸文字按钮

  使用链接语义承载当前站点的文本操作，统一图标、边框与 32px 高度。
============================================================================*/

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./button.module.css";

interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> {
    children: ReactNode;
    href: string;
    icon?: IconName;
}

export function Button({ children, href, icon, ...props }: ButtonProps) {
    return (
        <a className={styles.root} href={href} {...props}>
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
            {children}
        </a>
    );
}
