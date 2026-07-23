/*============================================================================
  icons - 图标组件

  基于 Lucide 统一管理站点图标，并提供按名称与具名组件两种用法。
============================================================================*/

import { ArrowDown, type LucideProps } from "lucide-react";

const ICON_COMPONENTS = {
    "arrow-down": ArrowDown,
} as const;

export type IconName = keyof typeof ICON_COMPONENTS;

export interface IconProps extends Omit<LucideProps, "children"> {
    name: IconName;
}

export function Icon({ name, "aria-label": ariaLabel, ...props }: IconProps) {
    const IconComponent = ICON_COMPONENTS[name];

    return (
        <IconComponent
            aria-hidden={ariaLabel ? undefined : true}
            aria-label={ariaLabel}
            focusable="false"
            {...props}
        />
    );
}

export function ArrowDownIcon(props: Omit<IconProps, "name">) {
    return <Icon name="arrow-down" {...props} />;
}
