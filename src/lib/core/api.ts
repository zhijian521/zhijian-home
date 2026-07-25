/*============================================================================
  api - 公共接口错误处理

  将服务端依赖异常统一转换为不泄露内部信息的 JSON 错误响应。
============================================================================*/

import "server-only";

import { NextResponse } from "next/server";

import { isServiceUnavailableError } from "@/lib/core/errors";

export async function withApiErrorHandling(handler: () => Promise<NextResponse>): Promise<NextResponse> {
    try {
        return await handler();
    } catch (error) {
        const status = isServiceUnavailableError(error) ? 503 : 500;
        const code = status === 503 ? "SERVICE_UNAVAILABLE" : "INTERNAL_SERVER_ERROR";

        /*== 对外使用泛化错误；日志仅保留类型，避免记录数据库连接等敏感细节 ==*/
        console.error("API 请求失败：", {
            name: error instanceof Error ? error.name : "UnknownError",
        });

        return NextResponse.json(
            {
                error: {
                    code,
                    message: "服务暂不可用，请稍后再试。",
                },
            },
            {
                status,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
