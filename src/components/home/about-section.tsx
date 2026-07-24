/*============================================================================
  about-section - 首页个人信息区

  提供 Hero CTA 的锚点目标，并展示头像、简介和现有的联系入口。
============================================================================*/

import Image from "next/image";

import { ABOUT_CONTENT, HERO_CONTENT } from "@/config/home";
import { Icon } from "@/components/ui/icons";

import styles from "./about-section.module.css";

export function AboutSection() {
    return (
        <section aria-labelledby="about-title" className={styles.section} id="about-me">
            <div className={styles.container}>
                <header className={styles.heading}>
                    <p className={styles.eyebrow}>About</p>
                    <h2 className={styles.title} id="about-title">
                        个人信息
                    </h2>
                </header>

                <div className={styles.profile}>
                    <Image
                        alt={`${HERO_CONTENT.author} 的头像`}
                        className={styles.avatar}
                        height={160}
                        sizes="(max-width: 40rem) 7rem, 10rem"
                        src="/images/profile.webp"
                        width={160}
                    />

                    <div className={styles.body}>
                        <h3 className={styles.name}>{HERO_CONTENT.author}</h3>
                        <p className={styles.tagline}>{HERO_CONTENT.tagline}</p>
                        <p className={styles.bio}>{ABOUT_CONTENT.bio}</p>

                        <nav aria-label="联系方式" className={styles.actions}>
                            <a className={styles.action} href={ABOUT_CONTENT.links.email}>
                                <Icon name="mail" size={16} />
                                联系我
                            </a>
                            <a
                                className={styles.action}
                                href={ABOUT_CONTENT.links.github}
                                rel="noreferrer"
                                target="_blank"
                            >
                                <Icon name="external-link" size={16} />
                                GitHub
                            </a>
                            <a
                                className={styles.action}
                                href={ABOUT_CONTENT.links.rss}
                                rel="noreferrer"
                                target="_blank"
                            >
                                <Icon name="rss" size={16} />
                                RSS
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
}
