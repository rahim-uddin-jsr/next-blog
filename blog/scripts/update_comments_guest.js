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
                ALTER TABLE comments 
                MODIFY COLUMN user_id INT NULL,
                ADD COLUMN author_name VARCHAR(100) AFTER user_id,
                ADD COLUMN author_email VARCHAR(100) AFTER author_name
            `);
            console.log("✅ Updated comments table for guest support.");
        } catch (err) {
            console.warn("⚠️ Warning (might be expected):", err.message);
        }

        await connection.end();
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

main();
