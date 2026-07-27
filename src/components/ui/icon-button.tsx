/*============================================================================
  icon-button - 图标操作按钮

  统一图标入口的尺寸与交互状态，根据用途输出导航链接或原生按钮。
============================================================================*/

import clsx from "clsx";
import Link from "next/link";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./icon-button.module.css";

/*== 共享属性 ==*/
interface IconButtonBaseProps {
    className?: string;
    icon: IconName;
    label: string;
    isActive?: boolean;
}

/*== 链接与原生按钮的属性保持互斥 ==*/
type LinkIconButtonProps = IconButtonBaseProps & {
    asButton?: false;
    href: string;
    onClick?: never;
};

type NativeIconButtonProps = IconButtonBaseProps & {
    asButton: true;
    href?: never;
    onClick: () => void;
};

type IconButtonProps = LinkIconButtonProps | NativeIconButtonProps;

/*== 按用途输出导航链接或操作按钮 ==*/
export function IconButton(props: IconButtonProps) {
    const { className, icon, label, isActive = false } = props;
    const rootClassName = clsx(styles.root, isActive && styles.active, className);

    if (props.asButton) {
        // 原生按钮用于触发本地操作，保留键盘交互语义。
        return (
            <button aria-label={label} className={rootClassName} onClick={props.onClick} title={label} type="button">
                <Icon name={icon} size="1rem" />
            </button>
        );
    }

    return (
        <Link aria-current={isActive ? "page" : undefined} aria-label={label} className={rootClassName} href={props.href} title={label}>
            <Icon name={icon} size="1rem" />
        </Link>
    );
}
