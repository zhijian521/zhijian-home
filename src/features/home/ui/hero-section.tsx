/*============================================================================
  hero-section — 首屏封面

  水墨背景图 + 标题 + 个人简介 + CTA，
  作为首页第一视觉提供全屏沉浸式入口。
============================================================================*/

import Image from "next/image";

import { ArrowDownIcon } from "@/components/ui/icons";
import { HERO_CONTENT } from "@/config/home";

import styles from "./hero-section.module.css";

export function HeroSection() {
    return (
        <section aria-labelledby="hero-title" className={styles.hero}>
            {/* 首屏背景与蒙版 */}
            <Image alt="" className={styles.heroBg} fill priority sizes="100vw" src="/images/bg-landscape.webp" />
            <div aria-hidden="true" className={styles.overlay} />

            {/* 首屏标题与简介 */}
            <div className={styles.content}>
                <h1 className={styles.title} id="hero-title">
                    {HERO_CONTENT.author}
                </h1>
                <p className={styles.sub}>{HERO_CONTENT.tagline}</p>
                <p className={styles.copy}>{HERO_CONTENT.motto}</p>
                <a className={styles.cta} href="#about-me">
                    <ArrowDownIcon className={styles.ctaIcon} />
                    开始探索
                </a>
            </div>
        </section>
    );
}
