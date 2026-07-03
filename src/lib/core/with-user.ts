/*============================================================================
  withUser — API Route 鉴权包装(只需登录,不限角色)

  用法:
    export const GET = withUser(async (request, user) => {
        return NextResponse.json(success(data));
    });
============================================================================*/

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSessionFromRequest, type SessionPayload } from '@/lib/core/auth';
import { BizCode, fail } from '@/lib/core/api-response';

type UserHandler = (
    request: NextRequest,
    user: SessionPayload,
    context: { params: Promise<Record<string, string | string[]>> },
) => Promise<Response | NextResponse> | Response | NextResponse;

export function withUser(handler: UserHandler) {
    return async (request: NextRequest, context: { params: Promise<Record<string, string | string[]>> }): Promise<Response | NextResponse> => {
        const session = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录。'), { status: 401 });
        }
        return handler(request, session, context);
    };
}
