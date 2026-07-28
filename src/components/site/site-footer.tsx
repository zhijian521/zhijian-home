/*============================================================================
  site-footer - 公开站点页脚

  延续旧站的版权文案；统计脚本随对应迁移单元单独接入。
============================================================================*/

import Link from "next/link";

import styles from "./site-footer.module.css";

export function SiteFooter() {
    return (
        <footer className={styles.footer}>
            <nav aria-label="页脚导航" className={styles.nav}>
                <Link href="/blog">知简博客</Link>
                <Link href="/nav">知简导航</Link>
            </nav>
            <p className={styles.copy}>© {new Date().getFullYear()} Zhijian：认真生活，简单做人，用心做事</p>
        </footer>
    );
}
