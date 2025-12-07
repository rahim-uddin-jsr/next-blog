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

        // Create TABLE
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Table 'settings' created or exists.");

        // Default Settings
        const defaults = {
            site_name: 'Next.js Blog',
            site_description: 'A modern blog built with Next.js and MySQL',
            footer_text: '© 2024 Next.js Blog. All rights reserved.',
            posts_per_page: '10',
            contact_email: 'admin@example.com',
            enable_comments: 'true'
        };

        for (const [key, value] of Object.entries(defaults)) {
            await connection.query(
                `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE setting_key=setting_key`, // Do nothing if exists, or update? Let's keep existing values if valid.
                [key, value]
            );
        }
        console.log("✅ Default settings ensured.");

        await connection.end();
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

main();
