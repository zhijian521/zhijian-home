/*============================================================================
  features/_registry — 功能文档索引

  /admin/docs 的功能文档 tab 从这里读取目录结构。每条 path 都是相对
  src/docs/features/ 的 .md 文件路径。改文档时顺手改这里，docs:check
  会校验“登记内容”和“磁盘文件”是否一致。
============================================================================*/

export interface DocEntry {
    path: string; // 例如 'style.md'
    title: string; // 展示标题
    module: string; // 分组，如 style / blog / nav / admin
    order: number; // 组内排序，越小越靠前
}

export const DOC_REGISTRY: DocEntry[] = [
    {
        path: 'style.md',
        title: '样式与主题',
        module: 'style',
        order: 1,
    },
];
