/*============================================================================
  icons - 图标组件

  基于 Lucide 统一管理站点图标，并提供按名称与具名组件两种用法。
============================================================================*/

import { ArrowDown, ArrowUpRight, Home, List, Mail, Rss, type LucideProps } from "lucide-react";

/*== 图标注册表 ==*/
const ICON_COMPONENTS = {
    "arrow-down": ArrowDown,
    "external-link": ArrowUpRight,
    home: Home,
    list: List,
    mail: Mail,
    rss: Rss,
} as const;

/*== 名称类型由注册表键自动推导 ==*/
export type IconName = keyof typeof ICON_COMPONENTS;

/*== 继承 SVG 属性，禁止外部传入 children ==*/
export interface IconProps extends Omit<LucideProps, "children"> {
    name: IconName;
}

/*== 有标签时提供语义，否则作为装饰图标隐藏 ==*/
export function Icon({ name, "aria-label": ariaLabel, ...props }: IconProps) {
    const IconComponent = ICON_COMPONENTS[name];

    return (
        <IconComponent aria-hidden={ariaLabel ? undefined : true} aria-label={ariaLabel} focusable="false" {...props} />
    );
}

/*== 固定图标名称的便捷组件 ==*/
export function ArrowDownIcon(props: Omit<IconProps, "name">) {
    return <Icon name="arrow-down" {...props} />;
}
