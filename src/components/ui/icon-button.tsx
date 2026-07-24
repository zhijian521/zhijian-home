/*============================================================================
  icon-button - 图标导航按钮

  统一图标入口的尺寸与交互状态，同时保留导航链接的原生语义。
============================================================================*/

import Link from "next/link";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./icon-button.module.css";

interface IconButtonProps {
    href: string;
    icon: IconName;
    label: string;
    isActive?: boolean;
}

export function IconButton({ href, icon, label, isActive = false }: IconButtonProps) {
    return (
        <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={`${styles.root} ${isActive ? styles.active : ""}`}
            href={href}
            title={label}
        >
            <Icon name={icon} size="1rem" />
        </Link>
    );
}
