/*============================================================================
  button - 固定尺寸文字按钮

  使用链接或按钮语义承载站点文本操作，统一图标、边框与 32px 高度。
============================================================================*/

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./button.module.css";

/*== 共享属性 ==*/
interface ButtonBaseProps {
    children: ReactNode;
    className?: string;
    icon?: IconName;
    isActive?: boolean;
    isDisabled?: boolean;
    variant?: "default" | "primary";
}

/*== 链接与原生按钮的属性保持互斥 ==*/
type LinkButtonProps = ButtonBaseProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
        asButton?: false;
        href?: string;
    };

type NativeButtonProps = ButtonBaseProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "disabled"> & {
        asButton: true;
        href?: never;
    };

type ButtonProps = LinkButtonProps | NativeButtonProps;

/*== 按操作目标输出链接或原生按钮 ==*/
export function Button(props: ButtonProps) {
    const { children, className, icon, isActive = false, isDisabled = false, variant = "default" } = props;
    const isUnavailable = !props.asButton && (isDisabled || !props.href);
    const isDisabledState = props.asButton ? isDisabled : isUnavailable;
    const rootClassName = clsx(styles.root, styles[variant], isActive && styles.active, isDisabledState && styles.disabled, className);
    const content = (
        <>
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
            {children}
        </>
    );

    if (props.asButton) {
        const {
            asButton: _asButton,
            children: _children,
            className: _className,
            href: _href,
            icon: _icon,
            isActive: _isActive,
            isDisabled: _isDisabled,
            variant: _variant,
            type,
            ...buttonProps
        } = props;

        /*== 原生操作保留 disabled 与 type 的浏览器语义 ==*/
        return (
            <button {...buttonProps} className={rootClassName} disabled={isDisabled} type={type ?? "button"}>
                {content}
            </button>
        );
    }

    const { href } = props;

    if (isDisabled || !href) {
        /*== 不渲染空链接，避免无效目标进入键盘焦点 ==*/
        return (
            <span aria-disabled="true" className={rootClassName}>
                {content}
            </span>
        );
    }

    const {
        asButton: _asButton,
        children: _children,
        className: _className,
        href: _href,
        icon: _icon,
        isActive: _isActive,
        isDisabled: _isDisabled,
        variant: _variant,
        ...anchorProps
    } = props;
    const ariaCurrent = isActive ? "page" : anchorProps["aria-current"];

    if (href.startsWith("/") && !href.startsWith("//")) {
        return (
            <Link {...anchorProps} aria-current={ariaCurrent} className={rootClassName} href={href}>
                {content}
            </Link>
        );
    }

    return (
        <a {...anchorProps} aria-current={ariaCurrent} className={rootClassName} href={href}>
            {content}
        </a>
    );
}
