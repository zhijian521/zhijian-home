import { type ClassValue, clsx } from 'clsx';

/*============================================================================
  utils — 通用纯函数

  只放真正跨域复用的工具。业务专用工具归对应 domain 文件,不堆这里。
============================================================================*/

/*== 合并 CSS 类名,通过 clsx 解析条件类。组件动态组合 className 用。 ==*/
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}
