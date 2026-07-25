/*============================================================================
  errors - 服务端错误类型

  将可预期的依赖不可用错误转换为安全、稳定的公开响应。
============================================================================*/

export class ServiceUnavailableError extends Error {
    constructor() {
        super("服务暂不可用。");
        this.name = "ServiceUnavailableError";
    }
}

export function isServiceUnavailableError(error: unknown): error is ServiceUnavailableError {
    return error instanceof ServiceUnavailableError;
}
