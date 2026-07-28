/*============================================================================
  nav urls - 导航链接校验

  统一处理搜索直达链接与书签地址，只允许可安全打开的 HTTP(S) 网址。
============================================================================*/

/*== 书签与直达搜索只允许网络链接，拒绝 javascript: 等可执行协议 ==*/
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

/*== 返回规范化的 HTTP(S) 地址；www. 开头的输入补全为 HTTPS ==*/
export function getNavHttpUrl(value: string): string | null {
    const input = value.trim();
    if (!input) return null;

    const candidate = input.startsWith("www.") ? `https://${input}` : input;

    try {
        const url = new URL(candidate);
        /*== 禁止凭据型 URL，避免展示域名与实际访问目标不一致 ==*/
        if (!HTTP_PROTOCOLS.has(url.protocol) || !url.hostname || url.username || url.password) {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
}
