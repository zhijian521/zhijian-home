import { createHmac, timingSafeEqual as cryptoTSR } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

/*============================================================================
  auth — session 鉴权基础设施

  负责:session token 签名/解析、cookie 读写、服务端守卫。
  不负责:用户 CRUD、密码哈希(那归 domain/users)。

  session token 格式:userId:username:role:expiresAt.signature  (HMAC-SHA256)
============================================================================*/

/*== 统一 session cookie 名称(admin + user 共用)。 ==*/
export const SESSION_COOKIE_NAME = 'zhijian_session';

/*== session 保留 7 天。 ==*/
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/*============================================================================
  类型
============================================================================*/

export type UserRole = 'admin' | 'user';

export interface SessionPayload {
    userId: number;
    username: string;
    role: UserRole;
}

/*============================================================================
  Session Token
============================================================================*/

/*== 根据用户信息生成签名 session token。 ==*/
export function createSessionToken(user: { id: number; username: string; role: UserRole }): string {
    const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
    const payload = `${user.id}:${user.username}:${user.role}:${expiresAt}`;
    const signature = signPayload(payload);
    return `${payload}.${signature}`;
}

/*== 解析并校验 session token,返回 payload 或 null。 ==*/
export function parseSessionToken(token: string | undefined): SessionPayload | null {
    if (!token) return null;

    const separatorIndex = token.lastIndexOf('.');
    if (separatorIndex < 0) return null;

    const payload = token.slice(0, separatorIndex);
    const signature = token.slice(separatorIndex + 1);

    if (!safeEqual(signature, signPayload(payload))) return null;

    const parts = payload.split(':');
    if (parts.length !== 4) return null;

    const [userIdStr, username, role, expiresAtStr] = parts;
    const userId = Number(userIdStr);
    const expiresAt = Number(expiresAtStr);

    if (!Number.isFinite(userId) || !Number.isFinite(expiresAt)) return null;
    if (role !== 'admin' && role !== 'user') return null;
    if (expiresAt <= Date.now()) return null;

    return { userId, username, role: role as UserRole };
}

/*============================================================================
  Cookie 工具
============================================================================*/

/*== 统一 session cookie 配置。 ==*/
export function getSessionCookieOptions() {
    return {
        httpOnly: true,
        maxAge: SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
    };
}

/*== 读 cookie → 解析 token → 返回 session payload 或 null(服务端组件用)。 ==*/
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return parseSessionToken(token);
}

/*== 从 NextRequest 读 cookie 并解析(API Route 用)。 ==*/
export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    return parseSessionToken(token);
}

/*============================================================================
  鉴权守卫
============================================================================*/

/*== 要求已登录(任意角色)。未登录 → 重定向到登录页。 ==*/
export async function requireAuth(redirectTo = '/admin/login'): Promise<SessionPayload> {
    const session = await getSessionFromCookies();
    if (!session) redirect(redirectTo);
    return session;
}

/*== 要求管理员角色。未登录 → 登录页;非 admin → 403 页。 ==*/
export async function requireAdmin(): Promise<SessionPayload> {
    const session = await requireAuth('/admin/login');
    if (session.role !== 'admin') redirect('/403');
    return session;
}

/*== API Route 版本:返回 session 或 null(不重定向,由包装器返回 JSON)。 ==*/
export function requireAdminFromRequest(request: NextRequest): SessionPayload | null {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'admin') return null;
    return session;
}

/*============================================================================
  签名辅助
============================================================================*/

/*== HMAC-SHA256 签名。 ==*/
function signPayload(payload: string): string {
    return createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/*== 从环境变量读取签名密钥,未配置时抛错阻止启动。 ==*/
function getSessionSecret(): string {
    if (!process.env.ADMIN_SESSION_SECRET) {
        throw new Error('ADMIN_SESSION_SECRET 未设置,请在 .env.local 中配置一个随机长字符串。');
    }
    return process.env.ADMIN_SESSION_SECRET;
}

/*== 常量时间字符串比较,防时序攻击。 ==*/
function safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return cryptoTSR(leftBuffer, rightBuffer);
}
