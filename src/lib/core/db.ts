import mysql from 'mysql2/promise';

/*============================================================================
  db — MySQL 连接池单例

  整个进程生命周期复用同一连接池。未配置 DATABASE_URL 时返回 null,
  让上层自行决定是否走示例数据回退。
============================================================================*/

/*== 模块级连接池单例。 ==*/
let pool: mysql.Pool | null = null;

/*== 获取 MySQL 连接池。 未配置数据库时返回 null。 ==*/
export function getDb(): mysql.Pool | null {
    if (!process.env.DATABASE_URL) return null;

    if (!pool) {
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            connectionLimit: 3,
            connectTimeout: 2000,
            waitForConnections: true,
            queueLimit: 0,
            timezone: '+08:00',
            charset: 'utf8mb4_unicode_ci',
        });
    }

    return pool;
}

/*== 获取已设置时区的独立连接(需要事务/NOW() 返回东八区时用)。 ==*/
export async function getDbConnection(): Promise<mysql.PoolConnection> {
    const p = getDb();
    if (!p) throw new Error('数据库未配置');
    const conn = await p.getConnection();
    await conn.execute("SET time_zone = '+08:00'");
    return conn;
}
