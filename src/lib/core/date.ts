/*============================================================================
  date - 日期展示

  统一处理数据库日期文本，避免各页面重复按浏览器本地时区解析。
============================================================================*/

/** 将文章日期文本格式化为中文内容展示格式；缺失时返回 null。 */
export function formatPostDate(value: string | null): string | null {
    if (!value) {
        return null;
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (!dateParts) {
        return value;
    }

    return `${dateParts[1]}年${Number(dateParts[2])}月${Number(dateParts[3])}日`;
}
