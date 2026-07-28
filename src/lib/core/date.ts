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

/*== 结构化数据使用中国时区解释数据库 DATETIME，避免服务器时区影响 ISO 输出。 ==*/
export function toPostIsoDateTime(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);

    if (!dateParts) {
        return undefined;
    }

    const [, year, month, day, hours = "00", minutes = "00", seconds = "00"] = dateParts;
    const timestamp = Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours) - 8,
        Number(minutes),
        Number(seconds),
    );

    return new Date(timestamp).toISOString();
}
