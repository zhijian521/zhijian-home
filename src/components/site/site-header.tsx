/*============================================================================
  site-header - 公开站点顶部品牌区

  当前只提供品牌链接和首页入口；移动端菜单与滚动状态在后续 H-002 子步骤接入。
============================================================================*/

import Image from "next/image";
import Link from "next/link";

import styles from "./site-header.module.css";

export function SiteHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link aria-label="返回 Zhijian 首页" className={styles.brand} href="/">
                    <Image
                        alt=""
                        className={styles.logo}
                        height={32}
                        src="/images/logo.webp"
                        width={32}
                    />
                    <span className={styles.brandText}>Zhijian</span>
                </Link>

                <nav aria-label="站点主导航" className={styles.nav}>
                    <Link className={styles.navLink} href="/">
                        首页
                    </Link>
                </nav>
            </div>
        </header>
    );
}
