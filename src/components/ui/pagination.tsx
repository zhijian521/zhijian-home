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

    const hasPreviousPage = current > 1;
    const hasNextPage = current < total;
    const items = getPaginationItems(current, total);

    return (
        <nav aria-label={ariaLabel} className={styles.root}>
            <Button href={hasPreviousPage ? getHref(current - 1) : undefined} isDisabled={!hasPreviousPage}>
                上一页
            </Button>

            {items.map((item) =>
                typeof item === "number" ? (
                    <Button className={styles.page} href={getHref(item)} isActive={item === current} key={item}>
                        {item}
                    </Button>
                ) : (
                    <span aria-hidden="true" className={styles.ellipsis} key={item}>
                        ...
                    </span>
                ),
            )}

            <Button href={hasNextPage ? getHref(current + 1) : undefined} isDisabled={!hasNextPage}>
                下一页
            </Button>
        </nav>
    );
}

/*== 页数过多时保留首尾页与当前页相邻页，避免导航条随总页数无限增长 ==*/
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
