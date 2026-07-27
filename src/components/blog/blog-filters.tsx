"use client";

/*============================================================================
  blog filters - 博客筛选

  使用 URL 链接承载筛选状态，桌面端显示右侧栏，移动端收纳进弹窗。
============================================================================*/

import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

import styles from "./blog-filters.module.css";

export interface BlogFilterOption {
    href: string;
    isActive: boolean;
    label: string;
}

export interface BlogActiveFilter {
    href: string;
    id: string;
    label: string;
}

interface BlogFiltersProps {
    activeFilters: BlogActiveFilter[];
    categories: BlogFilterOption[];
    clearAllHref?: string;
    tags: BlogFilterOption[];
}

interface BlogFilterOptionsProps {
    categories: BlogFilterOption[];
    onSelect?: () => void;
    tags: BlogFilterOption[];
}

export function BlogFilters({ activeFilters, categories, clearAllHref, tags }: BlogFiltersProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dialogId = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const hasCategories = categories.length > 1;
    const hasTags = tags.length > 0;
    const hasActiveFilters = activeFilters.length > 0;

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (isDialogOpen && !dialog.open) {
            dialog.showModal();
        }

        if (!isDialogOpen && dialog.open) {
            dialog.close();
        }
    }, [isDialogOpen]);

    useEffect(() => {
        const desktopMediaQuery = window.matchMedia("(min-width: 48rem)");

        function closeDialogOnDesktop(event: MediaQueryListEvent) {
            if (event.matches && dialogRef.current?.open) {
                // 桌面端改用侧栏，避免隐藏中的原生弹窗继续保持模态状态。
                dialogRef.current.close();
            }
        }

        desktopMediaQuery.addEventListener("change", closeDialogOnDesktop);

        return () => desktopMediaQuery.removeEventListener("change", closeDialogOnDesktop);
    }, []);

    if (!hasCategories && !hasTags) {
        return null;
    }

    function closeDialog() {
        const dialog = dialogRef.current;

        if (dialog?.open) {
            dialog.close();
            return;
        }

        setIsDialogOpen(false);
    }

    return (
        <>
            <div className={clsx(styles.active, !hasActiveFilters && styles.noActiveFilters)}>
                {hasActiveFilters ? (
                    <nav aria-label="当前筛选条件" className={styles.activeList}>
                        {activeFilters.map((filter) => (
                            <Button href={filter.href} icon="x" key={filter.id} variant="primary">
                                {filter.label}
                            </Button>
                        ))}
                        {clearAllHref ? <Button href={clearAllHref}>全部清除</Button> : null}
                    </nav>
                ) : null}

                <Button
                    aria-controls={dialogId}
                    aria-expanded={isDialogOpen}
                    asButton
                    className={styles.mobileTrigger}
                    onClick={() => setIsDialogOpen(true)}
                >
                    筛选
                </Button>
            </div>

            <aside aria-label="文章筛选" className={styles.sidebar}>
                <BlogFilterOptions categories={categories} tags={tags} />
            </aside>

            <dialog
                aria-labelledby={`${dialogId}-title`}
                className={styles.dialog}
                id={dialogId}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeDialog();
                    }
                }}
                onClose={() => setIsDialogOpen(false)}
                ref={dialogRef}
            >
                <header className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle} id={`${dialogId}-title`}>
                        筛选
                    </h2>
                    <IconButton asButton icon="x" label="关闭筛选" onClick={closeDialog} />
                </header>
                <div className={styles.dialogBody}>
                    <BlogFilterOptions categories={categories} onSelect={closeDialog} tags={tags} />
                </div>
            </dialog>
        </>
    );
}

function BlogFilterOptions({ categories, onSelect, tags }: BlogFilterOptionsProps) {
    const hasCategories = categories.length > 1;
    const hasTags = tags.length > 0;

    return (
        <>
            {hasCategories ? (
                <section className={styles.section}>
                    <div className={styles.heading}>
                        <h2 className={styles.title}>分类</h2>
                    </div>
                    <div className={styles.categories}>
                        {categories.map((category) => (
                            <Button href={category.href} isActive={category.isActive} key={category.href} onClick={onSelect} variant="primary">
                                {category.label}
                            </Button>
                        ))}
                    </div>
                </section>
            ) : null}

            {hasTags ? (
                <section className={styles.section}>
                    <div className={styles.heading}>
                        <h2 className={styles.title}>标签</h2>
                    </div>
                    <div className={styles.tags}>
                        {tags.map((tag) => (
                            <Button href={tag.href} isActive={tag.isActive} key={tag.href} onClick={onSelect}>
                                {tag.label}
                            </Button>
                        ))}
                    </div>
                </section>
            ) : null}
        </>
    );
}
