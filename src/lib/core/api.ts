/*============================================================================
  api - 公共接口响应

  统一成功与错误 JSON 结构，并安全转换未处理的服务端异常。
============================================================================*/

import "server-only";

import { NextResponse } from "next/server";

import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";

interface ApiSuccessBody<T> {
    data: T;
}

interface ApiErrorBody {
    error: {
        code: string;
        message: string;
    };
}

type ApiErrorOptions = Omit<ResponseInit, "status"> & {
    status: number;
};

/*== 成功响应保持统一的 data 包装 ==*/
export function jsonSuccess<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccessBody<T>> {
    return NextResponse.json({ data }, init);
}

/*== 错误响应默认禁止缓存，调用方仍可显式覆盖 ==*/
export function jsonError(code: string, message: string, options: ApiErrorOptions): NextResponse<ApiErrorBody> {
    const headers = new Headers(options.headers);

    if (!headers.has("Cache-Control")) {
        headers.set("Cache-Control", "no-store");
    }

    return NextResponse.json(
        {
            error: {
                code,
                message,
            },
        },
        {
            ...options,
            headers,
        }
    );
}

/*== 将未处理异常转换为不泄露内部信息的公共响应 ==*/
export async function withApiErrorHandling(handler: () => Promise<NextResponse>): Promise<NextResponse> {
    try {
        return await handler();
    } catch (error) {
        const status = isServiceUnavailableError(error) ? 503 : 500;
        const code = status === 503 ? "SERVICE_UNAVAILABLE" : "INTERNAL_SERVER_ERROR";

        /*== 对外使用泛化错误；日志仅保留类型，避免记录数据库连接等敏感细节 ==*/
        console.error("API 请求失败：", getErrorLogContext(error));

        return jsonError(code, "服务暂不可用，请稍后再试。", { status });
    }
}
