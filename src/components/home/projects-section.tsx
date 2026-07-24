/*============================================================================
  projects-section - 首页开源项目区

  展示已确认的静态开源项目；文章与 GitHub 动态数据继续由后续单元处理。
============================================================================*/

import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";
import { PROJECTS } from "@/config/home";

import styles from "./projects-section.module.css";

export function ProjectsSection() {
    return (
        <section aria-labelledby="projects-title" className={styles.section} id="projects">
            <div className={styles.container}>
                <SectionHeading id="projects-title">开源项目</SectionHeading>

                <div className={styles.grid}>
                    {PROJECTS.map((project) => (
                        <article className={styles.card} key={project.title}>
                            <div className={styles.header}>
                                <Icon className={styles.icon} name={project.icon} />
                                <h3 className={styles.title}>{project.title}</h3>
                            </div>

                            <p className={styles.description}>{project.description}</p>

                            <div aria-label={`${project.title} 使用的技术`} className={styles.tags}>
                                {project.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <Button href={project.siteHref} icon="external-link" rel="noopener noreferrer" target="_blank">
                                    访问站点
                                </Button>
                                <Button href={project.githubHref} icon="github" rel="noopener noreferrer" target="_blank">
                                    GitHub
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
