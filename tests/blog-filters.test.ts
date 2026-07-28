import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildBlogFilterOptions, getBlogHref, resolveBlogFilterState } from "../src/features/blog/lib/filters.ts";
import type { PublishedPostFilters } from "../src/types/post.ts";

const FILTER_OPTIONS: PublishedPostFilters = {
    categories: [
        { name: "前端", slug: "frontend" },
        { name: "后端", slug: "backend" },
    ],
    tags: [
        { name: "React", slug: "react" },
        { name: "Next.js", slug: "nextjs" },
    ],
};

describe("博客筛选参数", () => {
    it("省略默认页并稳定生成查询参数", () => {
        assert.equal(getBlogHref(), "/blog");
        assert.equal(
            getBlogHref({ categorySlug: "frontend", page: 2, tagSlugs: ["react", "nextjs"] }),
            "/blog?category=frontend&tags=react%2Cnextjs&page=2",
        );
    });

    it("丢弃不存在的分类和标签", () => {
        const result = resolveBlogFilterState(
            { categorySlug: "missing", tagSlugs: ["react", "missing"] },
            FILTER_OPTIONS,
        );

        assert.equal(result.category, undefined);
        assert.deepEqual(result.tags, [FILTER_OPTIONS.tags[0]]);
    });

    it("为已选标签生成取消选择链接", () => {
        const filters = resolveBlogFilterState({ categorySlug: "frontend", tagSlugs: ["react"] }, FILTER_OPTIONS);
        const { tags } = buildBlogFilterOptions(filters, FILTER_OPTIONS);

        assert.deepEqual(tags[0], {
            href: "/blog?category=frontend",
            isActive: true,
            label: "React",
        });
        assert.deepEqual(tags[1], {
            href: "/blog?category=frontend&tags=react%2Cnextjs",
            isActive: false,
            label: "Next.js",
        });
    });
});
