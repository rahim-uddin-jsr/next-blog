const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blog_db'
        });

        console.log("Connected to database.");

        try {
            await connection.query(`
                ALTER TABLE posts 
                ADD COLUMN published_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status
            `);
            console.log("✅ Successfully added published_at to posts table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ published_at column already exists.");
            } else {
                throw err;
            }
        }

        // Backfill existing posts
        await connection.query("UPDATE posts SET published_at = created_at WHERE published_at IS NULL");

        await connection.end();
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

main();
