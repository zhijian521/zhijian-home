/*============================================================================
  errors - 服务端错误类型

  将可预期的依赖不可用错误转换为安全、稳定的公开响应。
============================================================================*/

interface ErrorLogContext {
    name: string;
    code?: string;
}

export class ServiceUnavailableError extends Error {
    constructor(cause?: unknown) {
        super("服务暂不可用。", { cause });
        this.name = "ServiceUnavailableError";
    }
}

export function isServiceUnavailableError(error: unknown): error is ServiceUnavailableError {
    return error instanceof ServiceUnavailableError;
}

/*== 日志只输出错误类型和标准错误码，避免记录连接串或 SQL 详情 ==*/
export function getErrorLogContext(error: unknown): ErrorLogContext {
    const name = error instanceof Error ? error.name : "UnknownError";
    const cause = error instanceof Error && error.cause ? error.cause : error;
    const code = getSafeErrorCode(cause);

    return code ? { name, code } : { name };
}

function getSafeErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== "object" || !("code" in error)) {
        return undefined;
    }

    const code = error.code;
    return typeof code === "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(code) ? code : undefined;
}
