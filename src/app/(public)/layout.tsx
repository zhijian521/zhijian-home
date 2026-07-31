import type { PropsWithChildren } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

import styles from "./layout.module.css";

/*== 项目公开页面布局 ==*/
export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className={styles.root}>
            <SiteHeader />
            <div className={styles.main}>{children}</div>
            <SiteFooter />
        </div>
    );
}
