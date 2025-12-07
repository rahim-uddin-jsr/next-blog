const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function resetAdminPassword() {
    console.log('🔄 Resetting Admin Password...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'blog_db'
    });

    try {
        const password = 'admin123';
        console.log(`Generating hash for password: ${password}`);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('New Hash Generated via bcryptjs');

        // Update the admin user
        await connection.query(
            "UPDATE users SET password_hash = ? WHERE email = 'admin@blog.com'",
            [passwordHash]
        );

        console.log('✅ Admin password successfully reset to: admin123');

    } catch (error) {
        console.error('❌ Password reset failed:', error);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();
