/*============================================================================
  api - 公共接口响应

  统一成功与错误 JSON 结构，并安全转换未处理的服务端异常。
============================================================================*/

import "server-only";

import { NextResponse } from "next/server";

import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import type { ApiResponse } from "@/types/api";

const API_SUCCESS_CODE = "SUCCESS";
const API_SUCCESS_MESSAGE = "请求成功。";

type ApiErrorOptions = Omit<ResponseInit, "status"> & {
    status: number;
};

/*== 成功响应保持统一的 data 包装 ==*/
export function jsonSuccess<TData>(data: TData, init?: ResponseInit): NextResponse<ApiResponse<TData>> {
    return NextResponse.json(
        {
            code: API_SUCCESS_CODE,
            message: API_SUCCESS_MESSAGE,
            data,
        },
        init
    );
}

/*== 错误响应同样保留 code、message、data 字段，默认禁止缓存 ==*/
export function jsonError(code: string, message: string, options: ApiErrorOptions): NextResponse<ApiResponse<null>> {
    const headers = new Headers(options.headers);

    if (!headers.has("Cache-Control")) {
        headers.set("Cache-Control", "no-store");
    }

    return NextResponse.json(
        {
            code,
            message,
            data: null,
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
