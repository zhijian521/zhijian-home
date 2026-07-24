/*============================================================================
  site-header - 公开站点顶部品牌区

  当前仅展示已实现的公开路由；滚动后切换表面状态，保证内容区上的可读性。
============================================================================*/

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconButton } from "@/components/ui/icon-button";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";

import styles from "./site-header.module.css";

/*== 桌面端与移动端共享导航配置，保证入口和当前页状态一致 ==*/
const NAV_ITEMS = [
    { href: "/", icon: "home", label: "首页" },
    { href: "/blog", icon: "list", label: "文章" },
] as const;

export function SiteHeader() {
    const pathname = usePathname();
    const isScrolled = useScrollThreshold(8);
    const navItems = NAV_ITEMS.map((item) => ({
        ...item,
        isCurrent: pathname === item.href,
    }));

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
            <div className={styles.container}>
                <Link aria-label="返回 Zhijian 首页" className={styles.brand} href="/">
                    <Image alt="" className={styles.logo} height={32} src="/images/logo.webp" width={32} />
                    <span className={styles.brandText}>Zhijian</span>
                </Link>

                <nav aria-label="站点主导航" className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            aria-current={item.isCurrent ? "page" : undefined}
                            className={`${styles.navLink} ${item.isCurrent ? styles.navLinkActive : ""}`}
                            href={item.href}
                            key={item.href}
                        >
                            {item.label}
                            {item.isCurrent ? <span aria-hidden="true" className={styles.navUnderline} /> : null}
                        </Link>
                    ))}
                </nav>

                <nav aria-label="移动端站点导航" className={styles.mobileNav}>
                    {navItems.map((item) => (
                        <IconButton href={item.href} icon={item.icon} isActive={item.isCurrent} key={item.href} label={item.label} />
                    ))}
                </nav>
            </div>
        </header>
    );
}
