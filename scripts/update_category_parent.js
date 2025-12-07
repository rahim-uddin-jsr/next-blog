const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first if standard .env is not picked up, or just .env

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blog_db'
        });

        console.log("Connected to database.");

        // Check if column exists first to avoid error? Or just try ALTER IGNORE? 
        // Simple ALTER logic:
        try {
            await connection.query(`
                ALTER TABLE categories 
                ADD COLUMN parent_id INT DEFAULT NULL AFTER id,
                ADD CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
            `);
            console.log("✅ Successfully added parent_id to categories table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ parent_id column already exists.");
            } else {
                throw err;
            }
        }

        await connection.end();
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

main();
