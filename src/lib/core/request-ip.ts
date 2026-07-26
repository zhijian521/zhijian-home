/*============================================================================
  request-ip - 客户端 IP 提取

  仅信任由单跳 Nginx 覆写的转发头；部署拓扑变化时需重新评估取值策略。
============================================================================*/

import "server-only";

import { isIP } from "node:net";

const UNKNOWN_CLIENT_IP = "unknown";

export function getClientIp(request: Request): string {
    const realIp = getValidIp(request.headers.get("x-real-ip"));

    if (realIp) {
        return realIp;
    }

    const forwardedFor = request.headers.get("x-forwarded-for");

    if (!forwardedFor) {
        return UNKNOWN_CLIENT_IP;
    }

    /*== 单跳 Nginx 将真实来源追加到 XFF 链尾，因此从右向左读取 ==*/
    const forwardedChain = forwardedFor.split(",");

    for (let index = forwardedChain.length - 1; index >= 0; index -= 1) {
        const forwardedIp = getValidIp(forwardedChain[index]);

        if (forwardedIp) {
            return forwardedIp;
        }
    }

    return UNKNOWN_CLIENT_IP;
}

function getValidIp(value: string | null): string | null {
    const ip = value?.trim();

    if (!ip || isIP(ip) === 0) {
        return null;
    }

    return ip;
}
