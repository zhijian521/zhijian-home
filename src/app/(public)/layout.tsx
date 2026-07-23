/*============================================================================
  public layout - 公开路由布局

  建立公开页面的路由边界并接入顶部品牌区，页脚在后续 H-002 子步骤接入。
============================================================================*/

import { SiteHeader } from "@/components/site/site-header";
import type { AppLayoutProps } from "@/types/app";

export default function PublicLayout({ children }: AppLayoutProps) {
    return (
        <>
            <SiteHeader />
            {children}
        </>
    );
}
