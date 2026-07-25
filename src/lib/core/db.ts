/*============================================================================
  db - MySQL 连接池

  仅在服务端读取 DATABASE_URL；未配置时返回 null，由调用方决定降级方式。
============================================================================*/

import "server-only";

import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getDb(): mysql.Pool | null {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        return null;
    }

    if (!pool) {
        pool = mysql.createPool({
            uri: databaseUrl,
            /*== 限制连接与排队请求，避免突发流量耗尽数据库资源 ==*/
            connectionLimit: 3,
            connectTimeout: 2000,
            waitForConnections: true,
            queueLimit: 20,
            timezone: "+08:00",
            charset: "utf8mb4_unicode_ci",
            /*== 本机回环默认无需 TLS；远程连接通过 DATABASE_SSL=true 启用并验证证书 ==*/
            ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
        });
    }

    return pool;
}
