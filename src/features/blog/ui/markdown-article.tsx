/* eslint-disable @next/next/no-img-element -- Markdown 图片由 react-markdown 的安全 URL 转换处理，上传图和外链不适合 next/image。 */

/*== 不解析原始 HTML；公开阅读页与后台预览复用同一 Markdown 输出 ==*/

import type { ComponentPropsWithoutRef } from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./code-block";
import styles from "./markdown-article.module.css";

interface MarkdownArticleProps {
    content: string;
}

const MARKDOWN_COMPONENTS = {
    a: MarkdownLink,
    h1: MarkdownHeadingOne,
    h2: MarkdownHeadingTwo,
    h3: MarkdownHeadingThree,
    h4: MarkdownHeadingFour,
    h5: MarkdownHeadingFive,
    img: MarkdownImage,
    pre: CodeBlock,
    table: MarkdownTable,
};

export function MarkdownArticle({ content }: MarkdownArticleProps) {
    return (
        <div className={styles.body}>
            <ReactMarkdown components={MARKDOWN_COMPONENTS} rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

/*== 页面标题已占用 h1，正文标题整体下移一级以保持原有层级关系。 ==*/
function MarkdownHeadingOne(props: ComponentPropsWithoutRef<"h1">) {
    return <h2 {...props} />;
}

function MarkdownHeadingTwo(props: ComponentPropsWithoutRef<"h2">) {
    return <h3 {...props} />;
}

function MarkdownHeadingThree(props: ComponentPropsWithoutRef<"h3">) {
    return <h4 {...props} />;
}

function MarkdownHeadingFour(props: ComponentPropsWithoutRef<"h4">) {
    return <h5 {...props} />;
}

function MarkdownHeadingFive(props: ComponentPropsWithoutRef<"h5">) {
    return <h6 {...props} />;
}

function MarkdownLink({ href, rel, target, ...props }: ComponentPropsWithoutRef<"a">) {
    const isExternal = href?.startsWith("https://") || href?.startsWith("http://");

    return (
        <a href={href} rel={isExternal ? "noopener noreferrer" : rel} target={isExternal ? "_blank" : target} {...props} />
    );
}

function MarkdownImage({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) {
    return <img alt={alt} loading="lazy" referrerPolicy="no-referrer" {...props} />;
}

interface MarkdownTableProps extends ComponentPropsWithoutRef<"table"> {
    node?: unknown;
}

/*== 保持原生 table 语义，仅由外层承担窄屏横向滚动。 ==*/
function MarkdownTable({ node: _node, ...props }: MarkdownTableProps) {
    return (
        <div className={styles.table}>
            <table {...props} />
        </div>
    );
}
