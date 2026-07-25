/*============================================================================
  public layout - 公开路由布局

  建立公开页面的路由边界，统一提供顶部品牌区与页脚。
============================================================================*/

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { AppLayoutProps } from "@/types/app";

import styles from "./layout.module.css";

export default function PublicLayout({ children }: AppLayoutProps) {
    return (
        <div className={styles.root}>
            <SiteHeader />
            <div className={styles.main}>{children}</div>
            <SiteFooter />
        </div>
    );
}
