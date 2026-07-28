/*============================================================================
  nav-page - 导航页首页

  组合水墨背景、搜索栏和书签栏，不继承公开站点的页头与页脚。
============================================================================*/

import Image from "next/image";

import { BookmarkBar } from "@/features/nav/ui/bookmark-bar";
import { SearchBar } from "@/features/nav/ui/search-bar";

import styles from "./nav-page.module.css";

export function NavPage() {
    return (
        <main className={styles.root}>
            <Image alt="" className={styles.background} fill priority sizes="100vw" src="/images/bg-nav.webp" />
            <div aria-hidden="true" className={styles.overlay} />

            <section aria-labelledby="nav-title" className={styles.content}>
                <h1 className={styles.title} id="nav-title">
                    Zhijian
                </h1>
                <SearchBar />
                <BookmarkBar />
            </section>
        </main>
    );
}
