/*============================================================================
  pagination - 固定页码分页

  由页面提供目标 URL，仅负责上一页、页码、省略号与下一页的通用展示。
============================================================================*/

import { Button } from "@/components/ui/button";

import styles from "./pagination.module.css";

interface PaginationProps {
    ariaLabel?: string;
    current: number;
    getHref: (page: number) => string;
    total: number;
}

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export function Pagination({ ariaLabel = "分页导航", current, getHref, total }: PaginationProps) {
    if (total <= 1) {
        return null;
    }

    return (
        <nav aria-label={ariaLabel} className={styles.root}>
            {current > 1 ? (
                <Button href={getHref(current - 1)}>上一页</Button>
            ) : (
                <Button isDisabled>上一页</Button>
            )}

            {getPaginationItems(current, total).map((item) =>
                typeof item === "number" ? (
                    <Button
                        className={styles.page}
                        href={getHref(item)}
                        isActive={item === current}
                        key={item}
                    >
                        {item}
                    </Button>
                ) : (
                    <span aria-hidden="true" className={styles.ellipsis} key={item}>
                        ...
                    </span>
                ),
            )}

            {current < total ? (
                <Button href={getHref(current + 1)}>下一页</Button>
            ) : (
                <Button isDisabled>下一页</Button>
            )}
        </nav>
    );
}

function getPaginationItems(current: number, total: number): PaginationItem[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: PaginationItem[] = [1];
    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    if (rangeStart > 2) {
        items.push("start-ellipsis");
    }

    for (let page = rangeStart; page <= rangeEnd; page += 1) {
        items.push(page);
    }

    if (rangeEnd < total - 1) {
        items.push("end-ellipsis");
    }

    items.push(total);

    return items;
}
