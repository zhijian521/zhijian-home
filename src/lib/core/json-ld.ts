/*============================================================================
  json-ld - 结构化数据序列化

  将 Schema.org 数据安全地嵌入 JSON-LD script，避免内容中的 </script> 提前闭合标签。
============================================================================*/

export function serializeJsonLd(value: object): string {
    const json = JSON.stringify(value);

    if (json === undefined) {
        throw new TypeError("JSON-LD 数据必须可序列化。");
    }

    return json.replace(/</g, "\\u003c");
}
