import mysql from 'mysql2/promise';

let pool;

export function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blog_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
}

export async function query(sql, params) {
    const pool = getPool();
    const [results] = await pool.execute(sql, params);
    return results;
}
