/*============================================================================
  site-header - 公开站点顶部品牌区

  当前仅展示已实现的公开路由；滚动后切换表面状态，保证内容区上的可读性。
============================================================================*/

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./site-header.module.css";

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    /*== 根据页面滚动位置切换顶部栏表面状态 ==*/
    useEffect(() => {
        const updateScrollState = () => {
            const nextIsScrolled = window.scrollY > 8;

            setIsScrolled((currentIsScrolled) =>
                currentIsScrolled === nextIsScrolled ? currentIsScrolled : nextIsScrolled,
            );
        };

        updateScrollState();
        window.addEventListener("scroll", updateScrollState, { passive: true });

        return () => window.removeEventListener("scroll", updateScrollState);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
            <div className={styles.container}>
                <Link aria-label="返回 Zhijian 首页" className={styles.brand} href="/">
                    <Image alt="" className={styles.logo} height={32} src="/images/logo.webp" width={32} />
                    <span className={styles.brandText}>Zhijian</span>
                </Link>

                <nav aria-label="站点主导航" className={styles.nav}>
                    <Link aria-current="page" className={`${styles.navLink} ${styles.navLinkActive}`} href="/">
                        首页
                        <span aria-hidden="true" className={styles.navUnderline} />
                    </Link>
                </nav>
            </div>
        </header>
    );
}
